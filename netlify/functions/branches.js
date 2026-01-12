import { neon } from '@netlify/neon'
import { createHmac, timingSafeEqual } from 'node:crypto'

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
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

      await sql`
        CREATE TABLE IF NOT EXISTS branches (
          id BIGSERIAL PRIMARY KEY,
          owner_id BIGINT NOT NULL,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'sales & services',
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          team JSONB DEFAULT '{}' NOT NULL,
          UNIQUE(owner_id, code)
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS branch_requests (
          id BIGSERIAL PRIMARY KEY,
          owner_id BIGINT NOT NULL,
          requested_count INT,
          requested_reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      ` 

      await sql`ALTER TABLE branches ADD COLUMN IF NOT EXISTS team JSONB DEFAULT '{}' NOT NULL`

      await sql`CREATE INDEX IF NOT EXISTS branches_owner_id_idx ON branches(owner_id)`
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
  const suffix = url.pathname.split('/.netlify/functions/branches')[1] || ''
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

const parseId = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const normalizeType = (value) => {
  const t = String(value || '').trim().toLowerCase()
  if (t === 'sales' || t === 'service' || t === 'sales & services') return t
  return 'sales & services'
}

const normalizeStatus = (value) => {
  const s = String(value || '').trim().toLowerCase()
  if (s === 'active' || s === 'inactive' || s === 'under_maintenance') return s
  return 'active'
}

const TEAM_KEYS = ['executives', 'mechanics', 'callboys', 'staff']

const parseTeamEntry = (entry) => {
  if (!entry) return null
  if (typeof entry === 'object') {
    const name = String(entry.name || entry.value || '').trim()
    if (!name) return null
    const phone = String(entry.phone || entry.contact || entry.mobile || '').replace(/\D/g, '')
    return phone ? { name, phone } : { name }
  }
  const raw = String(entry || '').trim()
  if (!raw) return null
  const parts = raw.split(/[|:]/).map((p) => p.trim()).filter(Boolean)
  const name = parts[0]
  if (!name) return null
  const phone = parts.slice(1).join('').replace(/\D/g, '')
  return phone ? { name, phone } : { name }
}

const normalizeTeamList = (value) => {
  if (!value) return []
  const arr = Array.isArray(value) ? value : String(value || '').split(/[\n,;]+/)
  const seen = new Map()
  arr.forEach((entry) => {
    const parsed = parseTeamEntry(entry)
    if (!parsed?.name) return
    const key = parsed.name.toLowerCase()
    if (!seen.has(key)) seen.set(key, parsed)
  })
  return Array.from(seen.values())
}

const normalizeTeam = (raw = {}) => {
  const team = {}
  TEAM_KEYS.forEach((key) => {
    const list = normalizeTeamList(raw[key] || raw[key === 'mechanics' ? 'mechanic' : key])
    if (list.length) team[key] = list
  })
  return team
}

const getAuthUser = async (request) => {
  const token = readToken(request)
  const payload = verifyToken(token)
  if (!payload?.id) return null
  const [user] = await sql`
    SELECT id, role, owner_id, branch_id
    FROM users
    WHERE id = ${payload.id}
    LIMIT 1
  `
  return user || null
}

const fetchOwnerByUserId = async (userId) => {
  const [owner] = await sql`
    SELECT id, user_id, max_branches
    FROM owners
    WHERE user_id = ${userId}
    LIMIT 1
  `
  return owner || null
}

const fetchOwnerById = async (ownerId) => {
  if (!ownerId) return null
  const [owner] = await sql`
    SELECT id, user_id, max_branches
    FROM owners
    WHERE id = ${ownerId}
    LIMIT 1
  `
  return owner || null
}

const isAdmin = (user) => String(user?.role || '').toLowerCase() === 'admin'
const isOwner = (user) => String(user?.role || '').toLowerCase() === 'owner'

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders })

  const path = parsePath(new URL(request.url))

  try {
    await ensureTables()
  } catch (err) {
    console.error('Failed to ensure branches tables', err)
    return json(500, { success: false, message: 'Database not ready' })
  }

  // GET /api/branches/public
  if (request.method === 'GET' && path === '/public') {
    const url = new URL(request.url)
    const ownerParam = url.searchParams.get('owner') || ''
    const q = url.searchParams.get('q') || ''
    const status = url.searchParams.get('status') || ''
    const type = url.searchParams.get('type') || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)

    let ownerId = parseId(ownerParam)
    if (!ownerId) {
      const authUser = await getAuthUser(request)
      if (authUser?.owner_id) ownerId = authUser.owner_id
      if (authUser && authUser.role === 'owner') {
        const owner = await fetchOwnerByUserId(authUser.id)
        ownerId = owner?.id || null
      }
    }

    if (!ownerId) {
      return json(200, { success: true, data: { items: [], total: 0 } })
    }

    const filter = []
    const values = []

    values.push(ownerId)
    filter.push(`owner_id = $${values.length}`)

    if (q) {
      const like = `%${q.toLowerCase()}%`
      values.push(like, like)
      filter.push(`(LOWER(code) LIKE $${values.length - 1} OR LOWER(name) LIKE $${values.length})`)
    }
    if (status) {
      values.push(normalizeStatus(status))
      filter.push(`status = $${values.length}`)
    }
    if (type) {
      values.push(normalizeType(type))
      filter.push(`type = $${values.length}`)
    }

    const where = filter.length ? `WHERE ${filter.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    const listQuery = `
    SELECT id, owner_id, code, name, type, status, team
      FROM branches
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `
    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM branches
      ${where}
    `

    const items = await sql(listQuery, [...values, limit, offset])
    const [{ count }] = await sql(countQuery, values)
    return json(200, { success: true, data: { items, total: count } })
  }

  const authUser = await getAuthUser(request)
  if (!authUser) {
    return json(401, { success: false, message: 'Unauthorized' })
  }

  // GET /api/branches
  if (request.method === 'GET' && path === '/') {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const status = url.searchParams.get('status') || ''
    const type = url.searchParams.get('type') || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)

    let ownerId = null
    if (isOwner(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      ownerId = owner?.id || null
    } else if (authUser.owner_id) {
      ownerId = authUser.owner_id
    }

    if (!isAdmin(authUser) && !ownerId && authUser.branch_id) {
      const [branch] = await sql`
      SELECT id, owner_id, code, name, type, status, team
        FROM branches
        WHERE id = ${authUser.branch_id}
        LIMIT 1
      `
      return json(200, { success: true, data: { items: branch ? [branch] : [], total: branch ? 1 : 0 } })
    }

    const filter = []
    const values = []

    if (!isAdmin(authUser)) {
      if (!ownerId) return json(200, { success: true, data: { items: [], total: 0 } })
      values.push(ownerId)
      filter.push(`owner_id = $${values.length}`)
    }

    if (q) {
      const like = `%${q.toLowerCase()}%`
      values.push(like, like)
      filter.push(`(LOWER(code) LIKE $${values.length - 1} OR LOWER(name) LIKE $${values.length})`)
    }
    if (status) {
      values.push(normalizeStatus(status))
      filter.push(`status = $${values.length}`)
    }
    if (type) {
      values.push(normalizeType(type))
      filter.push(`type = $${values.length}`)
    }

    const where = filter.length ? `WHERE ${filter.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    const listQuery = `
      SELECT id, owner_id, code, name, type, status, team
      FROM branches
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `
    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM branches
      ${where}
    `

    const items = await sql(listQuery, [...values, limit, offset])
    const [{ count }] = await sql(countQuery, values)
    return json(200, { success: true, data: { items, total: count } })
  }

  // GET /api/branches/:id
  if (request.method === 'GET' && /^\/[0-9]+$/.test(path)) {
    const id = parseId(path.replace('/', ''))
    if (!id) return json(400, { success: false, message: 'Invalid branch id' })

    const [branch] = await sql`
      SELECT id, owner_id, code, name, type, status, team
      FROM branches
      WHERE id = ${id}
      LIMIT 1
    `
    if (!branch) return json(404, { success: false, message: 'Branch not found' })

    if (!isAdmin(authUser)) {
      const ownerId = isOwner(authUser)
        ? (await fetchOwnerByUserId(authUser.id))?.id
        : authUser.owner_id
      if (ownerId && branch.owner_id !== ownerId && authUser.branch_id !== branch.id) {
        return json(403, { success: false, message: 'Forbidden' })
      }
    }

    return json(200, { success: true, data: branch })
  }

  // POST /api/branches
  if (request.method === 'POST' && path === '/') {
    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const code = String(body.code || '').trim().toUpperCase()
    const name = String(body.name || '').trim()
    const type = normalizeType(body.type)
    const status = normalizeStatus(body.status)
    if (!code || !name) return json(400, { success: false, message: 'code and name are required' })

    let ownerId = null
    if (isAdmin(authUser) && body.ownerId) {
      ownerId = parseId(body.ownerId)
    }
    if (!ownerId) {
      const owner = await fetchOwnerByUserId(authUser.id)
      ownerId = owner?.id || null
    }
    if (!ownerId) return json(400, { success: false, message: 'Owner not found' })

    if (!isAdmin(authUser)) {
      const owner = await fetchOwnerById(ownerId)
      if (!owner) return json(404, { success: false, message: 'Owner not found' })
      const [{ count }] = await sql`
        SELECT COUNT(*)::int AS count FROM branches WHERE owner_id = ${ownerId}
      `
      if (count >= owner.max_branches) {
        await sql`
          INSERT INTO branch_requests (owner_id, requested_count, requested_reason)
          VALUES (${ownerId}, ${count + 1}, ${String(body.requestReason || '').trim() || null})
        `
        return json(403, { success: false, message: 'Branch limit reached. Request admin approval.' })
      }
    }

    const teamInput = {
      ...(body.team || {}),
      executives: body.executives ?? (body.team?.executives || body.team?.executive),
      mechanics: body.mechanics ?? (body.team?.mechanics || body.team?.mechanic),
      callboys: body.callboys ?? body.team?.callboys,
      staff: body.staff ?? body.team?.staff,
    }
    const teamPayload = normalizeTeam(teamInput)

    try {
      const [created] = await sql`
        INSERT INTO branches (owner_id, code, name, type, status, team)
        VALUES (${ownerId}, ${code}, ${name}, ${type}, ${status}, ${teamPayload})
        RETURNING id, owner_id, code, name, type, status, team
      `
      return json(201, { success: true, message: 'Branch created', data: created })
    } catch (err) {
      if (err?.code === '23505') {
        return json(409, { success: false, message: 'Branch code already exists for this owner' })
      }
      console.error('POST /branches failed', err)
      return json(500, { success: false, message: 'Failed to create branch' })
    }
  }

  // PUT /api/branches/:id
  if (request.method === 'PUT' && /^\/[0-9]+$/.test(path)) {
    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    const id = parseId(path.replace('/', ''))
    if (!id) return json(400, { success: false, message: 'Invalid branch id' })

    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const [current] = await sql`
      SELECT id, owner_id FROM branches WHERE id = ${id} LIMIT 1
    `
    if (!current) return json(404, { success: false, message: 'Branch not found' })

    if (!isAdmin(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      if (!owner || owner.id !== current.owner_id) {
        return json(403, { success: false, message: 'Forbidden' })
      }
    }

    const code = body.code ? String(body.code).trim().toUpperCase() : null
    const name = body.name ? String(body.name).trim() : null
    const type = body.type ? normalizeType(body.type) : null
    const status = body.status ? normalizeStatus(body.status) : null
    const teamInput = {
      ...(body.team || {}),
      executives: body.executives ?? (body.team?.executives || body.team?.executive),
      mechanics: body.mechanics ?? (body.team?.mechanics || body.team?.mechanic),
      callboys: body.callboys ?? body.team?.callboys,
      staff: body.staff ?? body.team?.staff,
    }
    const teamPayload = normalizeTeam(teamInput)
    const hasTeamPayload = Object.keys(teamPayload).length > 0

    try {
      const [updated] = await sql`
        UPDATE branches
        SET code = COALESCE(${code}, code),
            name = COALESCE(${name}, name),
            type = COALESCE(${type}, type),
            status = COALESCE(${status}, status),
            team = CASE WHEN ${hasTeamPayload} THEN ${teamPayload} ELSE team END,
            updated_at = now()
        WHERE id = ${id}
        RETURNING id, owner_id, code, name, type, status, team
      `
      return json(200, { success: true, message: 'Branch updated', data: updated })
    } catch (err) {
      if (err?.code === '23505') {
        return json(409, { success: false, message: 'Branch code already exists for this owner' })
      }
      console.error('PUT /branches failed', err)
      return json(500, { success: false, message: 'Failed to update branch' })
    }
  }

  // DELETE /api/branches/:id
  if (request.method === 'DELETE' && /^\/[0-9]+$/.test(path)) {
    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    const id = parseId(path.replace('/', ''))
    if (!id) return json(400, { success: false, message: 'Invalid branch id' })

    const [current] = await sql`
      SELECT id, owner_id FROM branches WHERE id = ${id} LIMIT 1
    `
    if (!current) return json(404, { success: false, message: 'Branch not found' })

    if (!isAdmin(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      if (!owner || owner.id !== current.owner_id) {
        return json(403, { success: false, message: 'Forbidden' })
      }
    }

    await sql`DELETE FROM branches WHERE id = ${id}`
    return json(200, { success: true, message: 'Branch deleted' })
  }

  return json(404, { success: false, message: 'Not found' })
}
