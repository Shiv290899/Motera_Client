import { neon } from '@netlify/neon'

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
        CREATE TABLE IF NOT EXISTS branches (
          id BIGSERIAL PRIMARY KEY,
          owner_id BIGINT NOT NULL,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'sales & services',
          status TEXT NOT NULL DEFAULT 'active',
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
  const suffix = url.pathname.split('/.netlify/functions/forms')[1] || ''
  return suffix || '/'
}

const normalizeMobile10 = (raw) => {
  const d = String(raw || '').replace(/\D/g, '').slice(-10)
  return d.length === 10 ? d : ''
}

const shortId6 = () => {
  return Math.random().toString(36).slice(-6).toUpperCase()
}

const buildSerial = (kind, branchCode) => {
  const bc = String(branchCode || '').trim().toUpperCase()
  const prefix = kind === 'jobcard' ? 'JC' : 'Q'
  return `${prefix}-${bc}-${shortId6()}`
}

const fetchBranchCode = async (branchId) => {
  if (!branchId) return ''
  const [branch] = await sql`
    SELECT code FROM branches WHERE id = ${branchId} LIMIT 1
  `
  return branch?.code || ''
}

const forwardWebhook = async ({ webhookUrl, payload, headers, method }) => {
  if (!webhookUrl) {
    return { ok: false, status: 400, data: { success: false, message: 'webhookUrl is required.' } }
  }
  const httpMethod = String(method || 'POST').toUpperCase()
  const reqHeaders = { 'Content-Type': 'application/json', ...(headers || {}) }
  if (httpMethod === 'GET') {
    const u = new URL(webhookUrl)
    Object.entries(payload || {}).forEach(([k, v]) => u.searchParams.append(k, String(v)))
    const resp = await fetch(u.toString(), { method: 'GET', headers: reqHeaders })
    const data = await resp.json().catch(() => ({}))
    return { ok: resp.ok, status: resp.status, data }
  }
  const resp = await fetch(webhookUrl, {
    method: httpMethod,
    headers: reqHeaders,
    body: JSON.stringify(payload || {}),
  })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, data }
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders })

  const path = parsePath(new URL(request.url))

  try {
    await ensureTables()
  } catch (err) {
    console.error('Failed to ensure forms tables', err)
    return json(500, { success: false, message: 'Database not ready' })
  }

  // GET /api/forms/quotation/next-serial
  if (request.method === 'GET' && path === '/quotation/next-serial') {
    return json(200, { success: true, nextSerial: '1', source: 'fallback' })
  }

  // GET /api/forms/jobcard/next-serial
  if (request.method === 'GET' && path === '/jobcard/next-serial') {
    return json(200, { success: true, nextSerial: '1', source: 'fallback' })
  }

  // POST /api/forms/quotation/serial/reserve
  if (request.method === 'POST' && path === '/quotation/serial/reserve') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const m10 = normalizeMobile10(body.mobile)
    let branchCode = String(body.branchCode || '').trim().toUpperCase()
    const branchId = body.branchId
    if (!branchCode && branchId) branchCode = await fetchBranchCode(branchId)
    if (!m10) return json(400, { success: false, message: 'Valid 10-digit mobile is required' })
    if (!branchCode) return json(400, { success: false, message: 'branchCode is required' })
    const serial = buildSerial('quotation', branchCode)
    return json(200, { success: true, serial })
  }

  // POST /api/forms/jobcard/serial/reserve
  if (request.method === 'POST' && path === '/jobcard/serial/reserve') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const m10 = normalizeMobile10(body.mobile)
    let branchCode = String(body.branchCode || '').trim().toUpperCase()
    const branchId = body.branchId
    if (!branchCode && branchId) branchCode = await fetchBranchCode(branchId)
    if (!m10) return json(400, { success: false, message: 'Valid 10-digit mobile is required' })
    if (!branchCode) return json(400, { success: false, message: 'branchCode is required' })
    const serial = buildSerial('jobcard', branchCode)
    return json(200, { success: true, serial })
  }

  // POST /api/forms/booking/webhook
  if (request.method === 'POST' && path === '/booking/webhook') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const result = await forwardWebhook(body)
    if (result.ok) return json(200, { success: true, forwarded: true, status: result.status, data: result.data })
    return json(502, { success: false, message: 'Webhook call failed', status: result.status, data: result.data })
  }

  // POST /api/forms/jobcard/webhook
  if (request.method === 'POST' && path === '/jobcard/webhook') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const result = await forwardWebhook(body)
    if (result.ok) return json(200, { success: true, forwarded: true, status: result.status, data: result.data })
    return json(502, { success: false, message: 'Webhook call failed', status: result.status, data: result.data })
  }

  // POST /api/forms/booking | /jobcard | /quotation | /stock
  if (request.method === 'POST' && ['/booking', '/jobcard', '/quotation', '/stock'].includes(path)) {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const result = await forwardWebhook(body)
    if (result.ok) return json(200, { success: true, forwarded: true, status: result.status, data: result.data })
    return json(502, { success: false, message: 'Webhook call failed', status: result.status, data: result.data })
  }

  return json(404, { success: false, message: 'Not found' })
}
