import { neon } from '@netlify/neon'
import { createHmac, timingSafeEqual } from 'node:crypto'

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
}

const sql = neon()
let tableReadyPromise

const ensureTables = async () => {
  if (!tableReadyPromise) {
    tableReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          status TEXT NOT NULL DEFAULT 'active',
          owner_id BIGINT,
          branch_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS owners (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT UNIQUE,
          web_app_url TEXT,
          logo_url TEXT,
          max_branches INT NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
    })()
  }
  return tableReadyPromise
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders },
  })

const parsePath = (url) => {
  const suffix = url.pathname.split('/.netlify/functions/stocks')[1] || ''
  return suffix || '/'
}

const signSecret = () => process.env.USER_TOKEN_SECRET || 'dev-only-secret'

const verifyToken = (token) => {
  if (!token) return null
  const [base, sig] = token.split('.')
  if (!base || !sig) return null
  const expected = createHmac('sha256', signSecret()).update(base).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return null
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null
  try {
    return JSON.parse(Buffer.from(base, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

const readToken = (request) => {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (token) return token
  const url = new URL(request.url)
  return url.searchParams.get('token') || ''
}

const resolveModuleUrl = (base, moduleName) => {
  if (!base) return ''
  try {
    const baseUrl = new URL(base)
    baseUrl.searchParams.set('module', moduleName)
    return baseUrl.toString()
  } catch {
    return base
  }
}

const fetchOwnerWebAppUrl = async (userId, ownerId) => {
  if (ownerId) {
    const [owner] = await sql`SELECT web_app_url FROM owners WHERE id = ${ownerId} LIMIT 1`
    return owner?.web_app_url || ''
  }
  const [owner] = await sql`SELECT web_app_url FROM owners WHERE user_id = ${userId} LIMIT 1`
  return owner?.web_app_url || ''
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders })

  const path = parsePath(new URL(request.url))
  if (path !== '/gas' && path !== '/') {
    return json(404, { success: false, message: 'Not found' })
  }

  try {
    await ensureTables()
  } catch (err) {
    console.error('Failed to ensure stocks tables', err)
    return json(500, { success: false, message: 'Database not ready' })
  }

  const token = readToken(request)
  const payload = verifyToken(token)
  if (!payload?.id) {
    return json(401, { success: false, message: 'Unauthorized' })
  }

  const [user] = await sql`
    SELECT id, role, owner_id
    FROM users
    WHERE id = ${payload.id}
    LIMIT 1
  `
  if (!user) return json(401, { success: false, message: 'Unauthorized' })

  const webAppUrl = await fetchOwnerWebAppUrl(user.id, user.owner_id)
  if (!webAppUrl) {
    return json(400, { success: false, message: 'Owner web app URL not configured' })
  }

  const targetUrl = resolveModuleUrl(webAppUrl, 'stocks')

  if (request.method === 'GET') {
    const url = new URL(targetUrl)
    const incoming = new URL(request.url)
    incoming.searchParams.forEach((value, key) => {
      if (key === 'token') return
      url.searchParams.append(key, value)
    })
    const resp = await fetch(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    const data = await resp.json().catch(() => ({}))
    return json(resp.ok ? 200 : 502, data)
  }

  if (request.method === 'POST') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    })
    const data = await resp.json().catch(() => ({}))
    return json(resp.ok ? 200 : 502, data)
  }

  return json(405, { success: false, message: 'Method not allowed' })
}
