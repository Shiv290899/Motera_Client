import { neon } from '@netlify/neon'
import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from 'node:crypto'

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
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
          reset_token TEXT,
          reset_expires_at TIMESTAMPTZ,
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

      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id BIGINT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id BIGINT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMPTZ`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`

      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS web_app_url TEXT`
      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS logo_url TEXT`
      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS max_branches INT DEFAULT 1`
      await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`

      await sql`ALTER TABLE branches ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sales & services'`
      await sql`ALTER TABLE branches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`
      await sql`ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique
        ON users(phone)
        WHERE phone IS NOT NULL AND phone <> ''
      `

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS users_branch_role_unique
        ON users(branch_id, role)
        WHERE role IN ('staff','mechanic','callboy') AND branch_id IS NOT NULL
      `

      await sql`CREATE INDEX IF NOT EXISTS users_owner_id_idx ON users(owner_id)`
      await sql`CREATE INDEX IF NOT EXISTS users_branch_id_idx ON users(branch_id)`
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

const hashPassword = (password, salt = randomBytes(16)) => {
  const derived = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

const verifyPassword = (password, stored) => {
  const [saltHex, hashHex] = String(stored || '').split(':')
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const storedHash = Buffer.from(hashHex, 'hex')
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(storedHash, derived)
}

const signToken = (payload) => {
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const secret = process.env.USER_TOKEN_SECRET || 'dev-only-secret'
  const sig = createHmac('sha256', secret).update(base).digest('base64url')
  return `${base}.${sig}`
}

const verifyToken = (token) => {
  if (!token) return null
  const [base, sig] = token.split('.')
  if (!base || !sig) return null
  const secret = process.env.USER_TOKEN_SECRET || 'dev-only-secret'
  const expected = createHmac('sha256', secret).update(base).digest('base64url')
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

const parsePath = (url) => {
  const suffix = url.pathname.split('/.netlify/functions/users')[1] || ''
  return suffix || '/'
}

const readToken = (request) => {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (token) return token
  const url = new URL(request.url)
  const qpToken = url.searchParams.get('token')
  return qpToken || ''
}

const ROLE_SET = new Set(['admin', 'owner', 'staff', 'mechanic', 'callboy', 'backend', 'user'])
const STATUS_SET = new Set(['active', 'inactive', 'suspended'])

const normalizeRole = (role) => {
  const r = String(role || '').trim().toLowerCase()
  if (r === 'executive') return 'staff'
  if (r === 'call-boy' || r === 'call_boy') return 'callboy'
  return ROLE_SET.has(r) ? r : 'user'
}

const normalizeStatus = (status) => {
  const s = String(status || '').trim().toLowerCase()
  return STATUS_SET.has(s) ? s : 'active'
}

const parseId = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const fetchOwnerByUserId = async (userId) => {
  const [owner] = await sql`
    SELECT id, user_id, web_app_url, logo_url, max_branches
    FROM owners
    WHERE user_id = ${userId}
    LIMIT 1
  `
  return owner || null
}

const fetchOwnerById = async (ownerId) => {
  if (!ownerId) return null
  const [owner] = await sql`
    SELECT id, user_id, web_app_url, logo_url, max_branches
    FROM owners
    WHERE id = ${ownerId}
    LIMIT 1
  `
  return owner || null
}

const fetchBranch = async (branchId) => {
  if (!branchId) return null
  const [branch] = await sql`
    SELECT id, owner_id, code, name, type, status
    FROM branches
    WHERE id = ${branchId}
    LIMIT 1
  `
  return branch || null
}

const ensureOwnerRecord = async (userId, maxBranches) => {
  const [owner] = await sql`
    INSERT INTO owners (user_id, max_branches)
    VALUES (${userId}, ${maxBranches || 1})
    ON CONFLICT (user_id) DO UPDATE SET
      max_branches = COALESCE(${maxBranches}, owners.max_branches),
      updated_at = now()
    RETURNING id, user_id, web_app_url, logo_url, max_branches
  `
  return owner
}

const buildUserResponse = async (row) => {
  if (!row) return null
  const owner = row.owner_id ? await fetchOwnerById(row.owner_id) : await fetchOwnerByUserId(row.id)
  const branch = row.branch_id ? await fetchBranch(row.branch_id) : null
  const ownerId = row.owner_id || owner?.id || null
  const branchId = row.branch_id || branch?.id || null
  const branchObj = branch
    ? {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        type: branch.type,
        status: branch.status,
        team: branch.team || {},
      }
    : null

  const ownerObj = owner
    ? {
        id: owner.id,
        webAppUrl: owner.web_app_url || '',
        logoUrl: owner.logo_url || '',
        maxBranches: owner.max_branches,
      }
    : null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role,
    status: row.status,
    ownerId,
    branchId,
    owner: ownerObj,
    primaryBranch: branchObj,
    branches: branchObj ? [branchObj] : [],
    formDefaults: {
      staffName: row.name || '',
      branchId: branchId || null,
      branchName: branchObj?.name || '',
      branchCode: branchObj?.code || '',
    },
  }
}

const requireAuthUser = async (request) => {
  const token = readToken(request)
  const payload = verifyToken(token)
  if (!payload?.id) return null
  const [user] = await sql`
    SELECT id, name, email, phone, role, status, owner_id, branch_id
    FROM users
    WHERE id = ${payload.id}
    LIMIT 1
  `
  return user || null
}

const isAdmin = (user) => String(user?.role || '').toLowerCase() === 'admin'
const isOwner = (user) => String(user?.role || '').toLowerCase() === 'owner'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders })

  const path = parsePath(new URL(request.url))

  try {
    await ensureTables()
  } catch (err) {
    console.error('Failed to ensure users tables', err)
    return json(500, { success: false, message: 'Database not ready' })
  }

  // GET /api/users/public
  if (request.method === 'GET' && path === '/public') {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const role = url.searchParams.get('role') || ''
    const status = url.searchParams.get('status') || ''
    const branch = url.searchParams.get('branch') || ''
    const ownerParam = url.searchParams.get('owner') || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)

    let ownerId = parseId(ownerParam)
    if (!ownerId) {
      const authUser = await requireAuthUser(request)
      if (authUser?.owner_id) ownerId = authUser.owner_id
      if (authUser && authUser.role === 'owner') {
        const owner = await fetchOwnerByUserId(authUser.id)
        if (owner?.id) ownerId = owner.id
      }
    }

    if (!ownerId) {
      return json(200, { success: true, data: { items: [], total: 0 }, public: true })
    }

    const filter = []
    const values = []

    values.push(ownerId)
    filter.push(`owner_id = $${values.length}`)

    if (q) {
      const like = `%${q.toLowerCase()}%`
      values.push(like, like, like)
      filter.push(
        `(LOWER(name) LIKE $${values.length - 2} OR LOWER(email) LIKE $${values.length - 1} OR phone LIKE $${values.length})`
      )
    }
    if (role) {
      values.push(normalizeRole(role))
      filter.push(`role = $${values.length}`)
    }
    if (status) {
      values.push(normalizeStatus(status))
      filter.push(`status = $${values.length}`)
    }
    if (branch) {
      values.push(parseId(branch))
      filter.push(`branch_id = $${values.length}`)
    }

    const where = filter.length ? `WHERE ${filter.join(' AND ')}` : ''
    const offset = (page - 1) * limit
    const listQuery = `
      SELECT id, name, email, phone, role, status, owner_id, branch_id
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `
    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM users
      ${where}
    `
    const items = await sql(listQuery, [...values, limit, offset])
    const [{ count }] = await sql(countQuery, values)

    const hydrated = await Promise.all(items.map(buildUserResponse))
    return json(200, { success: true, data: { items: hydrated, total: count }, public: true })
  }

  // POST /api/users/register
  if (request.method === 'POST' && path === '/register') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const name = String(body.name || '').trim()
    const email = normalizeEmail(body.email)
    const phone = body.phone ? String(body.phone).trim() : ''
    const password = String(body.password || '')

    if (!name || !email || password.length < 6) {
      return json(400, {
        success: false,
        message: 'Name, email and password (min 6 chars) are required.',
      })
    }

    try {
      const hashed = hashPassword(password)
      const [user] = await sql`
        INSERT INTO users (name, email, phone, password, role, status)
        VALUES (${name}, ${email}, ${phone || null}, ${hashed}, 'user', 'active')
        ON CONFLICT (email) DO NOTHING
        RETURNING id, name, email, phone, role, status, owner_id, branch_id
      `
      if (!user) {
        return json(409, { success: false, message: 'Email is already registered.' })
      }
      return json(201, { success: true, message: 'User registered', user: await buildUserResponse(user) })
    } catch (err) {
      if (err?.code === '23505') {
        return json(409, { success: false, message: 'Email or phone already exists.' })
      }
      console.error('Register error', err)
      return json(500, { success: false, message: 'Could not register user' })
    }
  }

  // POST /api/users/become-owner
  if (request.method === 'POST' && path === '/become-owner') {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })
    if (isOwner(authUser)) {
      return json(400, { success: false, message: 'Already an owner' })
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const webAppUrl = body.webAppUrl ? String(body.webAppUrl).trim() : null
    const logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null
    const maxBranches = Number.isFinite(Number(body.maxBranches)) ? Number(body.maxBranches) : undefined

    const owner = await ensureOwnerRecord(authUser.id, maxBranches)
    await sql`
      UPDATE users
      SET role = 'owner',
          owner_id = ${owner.id},
          updated_at = now()
      WHERE id = ${authUser.id}
    `

    const [updatedOwner] = await sql`
      UPDATE owners
      SET web_app_url = COALESCE(${webAppUrl}, web_app_url),
          logo_url = COALESCE(${logoUrl}, logo_url),
          updated_at = now()
      WHERE id = ${owner.id}
      RETURNING id, user_id, web_app_url, logo_url, max_branches
    `

    const [updatedUser] = await sql`
      SELECT id, name, email, phone, role, status, owner_id, branch_id
      FROM users
      WHERE id = ${authUser.id}
      LIMIT 1
    `
    if (!updatedUser) {
      return json(404, { success: false, message: 'User not found after upgrade' })
    }
    const safeUser = await buildUserResponse({ ...updatedUser, owner_id: updatedOwner?.id || owner.id })
    return json(200, { success: true, message: 'Owner profile created', data: safeUser })
  }

  // POST /api/users/login
  if (request.method === 'POST' && path === '/login') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const email = normalizeEmail(body.email)
    const password = String(body.password || '')

    if (!email || !password) {
      return json(400, { success: false, message: 'Email and password are required.' })
    }

    try {
      const [user] = await sql`
        SELECT id, name, email, phone, role, status, owner_id, branch_id, password
        FROM users
        WHERE email = ${email}
        LIMIT 1
      `
      if (!user || !verifyPassword(password, user.password)) {
        return json(401, { success: false, message: 'Invalid credentials.' })
      }
      const token = signToken({ id: user.id, email: user.email, role: user.role })
      const safeUser = await buildUserResponse(user)
      return json(200, { success: true, message: 'Logged in', token, user: safeUser })
    } catch (err) {
      console.error('Login error', err)
      return json(500, { success: false, message: 'Could not process login' })
    }
  }

  // GET /api/users/get-valid-user
  if (request.method === 'GET' && path === '/get-valid-user') {
    const authUser = await requireAuthUser(request)
    if (!authUser) {
      return json(401, { success: false, message: 'Invalid token' })
    }
    try {
      const safeUser = await buildUserResponse(authUser)
      return json(200, { success: true, data: safeUser })
    } catch (err) {
      console.error('Validate user error', err)
      return json(500, { success: false, message: 'Could not validate user' })
    }
  }

  // POST /api/users/forgot-password
  if (request.method === 'POST' && path === '/forgot-password') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const email = normalizeEmail(body.email)
    if (!email) return json(400, { success: false, message: 'Email is required.' })

    const [user] = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (!user) {
      return json(404, { success: false, message: 'We could not find an account with that email.' })
    }

    const rawToken = randomBytes(24).toString('hex')
    const hashedToken = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    await sql`
      UPDATE users
      SET reset_token = ${hashedToken}, reset_expires_at = ${expiresAt}, updated_at = now()
      WHERE id = ${user.id}
    `

    return json(200, {
      success: true,
      message: 'If the account exists, we have sent password reset instructions.',
      devResetToken: rawToken,
      emailSent: false,
    })
  }

  // POST /api/users/reset-password
  if (request.method === 'POST' && path === '/reset-password') {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }
    const token = String(body.token || '').trim()
    const password = String(body.password || '')
    if (!token || password.length < 6) {
      return json(400, { success: false, message: 'Token and new password are required.' })
    }

    const hashedToken = createHash('sha256').update(token).digest('hex')
    const [user] = await sql`
      SELECT id, reset_expires_at
      FROM users
      WHERE reset_token = ${hashedToken}
      LIMIT 1
    `
    if (!user || !user.reset_expires_at || new Date(user.reset_expires_at) <= new Date()) {
      return json(400, { success: false, message: 'Reset link is invalid or has expired.' })
    }

    const hashedPassword = hashPassword(password)
    await sql`
      UPDATE users
      SET password = ${hashedPassword}, reset_token = NULL, reset_expires_at = NULL, updated_at = now()
      WHERE id = ${user.id}
    `
    return json(200, { success: true, message: 'Password has been reset successfully.' })
  }

  // PATCH /api/users/profile (owner profile)
  if ((request.method === 'PATCH' || request.method === 'PUT') && path === '/profile') {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })
    if (!isOwner(authUser) && !isAdmin(authUser)) {
      return json(403, { success: false, message: 'Forbidden: owner/admin only' })
    }
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const name = body.name ? String(body.name).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const webAppUrl = body.webAppUrl ? String(body.webAppUrl).trim() : null
    const logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null

    if (name || phone) {
      await sql`
        UPDATE users
        SET name = COALESCE(${name}, name),
            phone = COALESCE(${phone}, phone),
            updated_at = now()
        WHERE id = ${authUser.id}
      `
    }

    let owner = await fetchOwnerByUserId(authUser.id)
    if (!owner && isOwner(authUser)) {
      owner = await ensureOwnerRecord(authUser.id, body.maxBranches)
      await sql`UPDATE users SET owner_id = ${owner.id}, updated_at = now() WHERE id = ${authUser.id}`
    }

    if (!owner && isAdmin(authUser) && body.ownerId) {
      owner = await fetchOwnerById(parseId(body.ownerId))
    }

    if (!owner) {
      return json(404, { success: false, message: 'Owner profile not found' })
    }

    const [updatedOwner] = await sql`
      UPDATE owners
      SET web_app_url = COALESCE(${webAppUrl}, web_app_url),
          logo_url = COALESCE(${logoUrl}, logo_url),
          updated_at = now()
      WHERE id = ${owner.id}
      RETURNING id, user_id, web_app_url, logo_url, max_branches
    `

    const safeUser = await buildUserResponse({ ...authUser, owner_id: updatedOwner.id })
    return json(200, { success: true, message: 'Profile updated', data: safeUser })
  }

  // GET /api/users (admin/owner)
  if (request.method === 'GET' && path === '/') {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })

    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const role = url.searchParams.get('role') || ''
    const status = url.searchParams.get('status') || ''
    const branch = url.searchParams.get('branch') || ''
    const ownerParam = url.searchParams.get('owner') || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)

    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    let ownerId = parseId(ownerParam)
    if (!ownerId && isOwner(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      ownerId = owner?.id || null
    }

    const filter = []
    const values = []

    if (ownerId) {
      values.push(ownerId)
      filter.push(`owner_id = $${values.length}`)
    }
    if (q) {
      const like = `%${q.toLowerCase()}%`
      values.push(like, like, like)
      filter.push(
        `(LOWER(name) LIKE $${values.length - 2} OR LOWER(email) LIKE $${values.length - 1} OR phone LIKE $${values.length})`
      )
    }
    if (role) {
      values.push(normalizeRole(role))
      filter.push(`role = $${values.length}`)
    }
    if (status) {
      values.push(normalizeStatus(status))
      filter.push(`status = $${values.length}`)
    }
    if (branch) {
      values.push(parseId(branch))
      filter.push(`branch_id = $${values.length}`)
    }

    const where = filter.length ? `WHERE ${filter.join(' AND ')}` : ''
    const offset = (page - 1) * limit
    const listQuery = `
      SELECT id, name, email, phone, role, status, owner_id, branch_id
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `
    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM users
      ${where}
    `
    const items = await sql(listQuery, [...values, limit, offset])
    const [{ count }] = await sql(countQuery, values)

    const hydrated = await Promise.all(items.map(buildUserResponse))
    return json(200, { success: true, data: { items: hydrated, total: count } })
  }

  // POST /api/users (admin/owner create)
  if (request.method === 'POST' && path === '/') {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })
    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const name = String(body.name || '').trim()
    const email = normalizeEmail(body.email)
    const phone = body.phone ? String(body.phone).trim() : ''
    const password = String(body.password || '')
    const role = normalizeRole(body.role)
    const status = normalizeStatus(body.status)

    if (!name || !email || password.length < 6) {
      return json(400, { success: false, message: 'name, email, password are required' })
    }

    if (role === 'admin' && !isAdmin(authUser)) {
      return json(403, { success: false, message: 'Only admin can create admin users' })
    }

    let branchId = null
    if (body.primaryBranch) branchId = parseId(body.primaryBranch)
    if (!branchId && Array.isArray(body.branches) && body.branches.length) {
      branchId = parseId(body.branches[0])
    }
    if (!branchId && body.branchId) branchId = parseId(body.branchId)

    let ownerId = null
    if (body.ownerId) ownerId = parseId(body.ownerId)

    if (role === 'owner') {
      if (!isAdmin(authUser)) {
        return json(403, { success: false, message: 'Only admin can create owners' })
      }
    }

    if (role === 'staff' || role === 'mechanic' || role === 'callboy') {
      if (!branchId) {
        return json(400, { success: false, message: 'branch is required for staff/mechanic/callboy' })
      }
      const branch = await fetchBranch(branchId)
      if (!branch) return json(404, { success: false, message: 'Branch not found' })
      if (isOwner(authUser)) {
        const owner = await fetchOwnerByUserId(authUser.id)
        if (!owner || branch.owner_id !== owner.id) {
          return json(403, { success: false, message: 'Forbidden: branch not in your account' })
        }
      }
      ownerId = branch.owner_id
    }

    if (role === 'backend') {
      if (isOwner(authUser)) {
        const owner = await fetchOwnerByUserId(authUser.id)
        ownerId = owner?.id || null
      }
      if (!ownerId) return json(400, { success: false, message: 'owner is required for backend role' })
      branchId = null
    }

    try {
      const hashed = hashPassword(password)
      const [user] = await sql`
        INSERT INTO users (name, email, phone, password, role, status, owner_id, branch_id)
        VALUES (${name}, ${email}, ${phone || null}, ${hashed}, ${role}, ${status}, ${ownerId || null}, ${branchId || null})
        RETURNING id, name, email, phone, role, status, owner_id, branch_id
      `

      if (role === 'owner') {
        const owner = await ensureOwnerRecord(user.id, body.maxBranches)
        await sql`UPDATE users SET owner_id = ${owner.id}, updated_at = now() WHERE id = ${user.id}`
      }

      return json(201, { success: true, message: 'User created', data: await buildUserResponse(user) })
    } catch (err) {
      if (err?.code === '23505') {
        if (String(err?.constraint || '').includes('users_branch_role_unique')) {
          return json(409, { success: false, message: 'Branch already has this role assigned.' })
        }
        return json(409, { success: false, message: 'Email or phone already exists.' })
      }
      console.error('Create user error', err)
      return json(500, { success: false, message: 'Failed to create user' })
    }
  }

  // PUT /api/users/:id
  if (request.method === 'PUT' && /^\/[0-9]+$/.test(path)) {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })

    const id = parseId(path.replace('/', ''))
    if (!id) return json(400, { success: false, message: 'Invalid user id' })

    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      return json(400, { success: false, message: 'Invalid JSON body' })
    }

    const [target] = await sql`
      SELECT id, role, owner_id, branch_id
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    if (!target) return json(404, { success: false, message: 'User not found' })

    if (isOwner(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      const ownerId = owner?.id
      if (target.id !== authUser.id && (!ownerId || target.owner_id !== ownerId)) {
        return json(403, { success: false, message: 'Forbidden' })
      }
      if (normalizeRole(body.role) === 'admin') {
        return json(403, { success: false, message: 'Owners cannot assign admin role' })
      }
    }

    let role = body.role ? normalizeRole(body.role) : target.role
    let status = body.status ? normalizeStatus(body.status) : target.status
    let branchId = target.branch_id

    if (body.primaryBranch) branchId = parseId(body.primaryBranch)
    if (Array.isArray(body.branches) && body.branches.length) branchId = parseId(body.branches[0])
    if (body.branchId) branchId = parseId(body.branchId)

    let ownerId = target.owner_id
    if (body.ownerId) ownerId = parseId(body.ownerId)

    if (role === 'staff' || role === 'mechanic' || role === 'callboy') {
      if (!branchId) {
        return json(400, { success: false, message: 'branch is required for staff/mechanic/callboy' })
      }
      const branch = await fetchBranch(branchId)
      if (!branch) return json(404, { success: false, message: 'Branch not found' })
      if (isOwner(authUser)) {
        const owner = await fetchOwnerByUserId(authUser.id)
        if (!owner || branch.owner_id !== owner.id) {
          return json(403, { success: false, message: 'Forbidden: branch not in your account' })
        }
      }
      ownerId = branch.owner_id
    }

    if (role === 'backend') {
      branchId = null
      if (isOwner(authUser)) {
        const owner = await fetchOwnerByUserId(authUser.id)
        ownerId = owner?.id || null
      }
      if (!ownerId) {
        return json(400, { success: false, message: 'owner is required for backend role' })
      }
    }

    if (role === 'owner') {
      if (!isAdmin(authUser)) {
        return json(403, { success: false, message: 'Only admin can assign owner role' })
      }
    }

    const name = body.name ? String(body.name).trim() : null
    const email = body.email ? normalizeEmail(body.email) : null
    const phone = body.phone != null ? String(body.phone || '').trim() : null
    const password = body.password ? hashPassword(String(body.password)) : null

    try {
      const [updated] = await sql`
        UPDATE users
        SET name = COALESCE(${name}, name),
            email = COALESCE(${email}, email),
            phone = COALESCE(${phone}, phone),
            password = COALESCE(${password}, password),
            role = ${role},
            status = ${status},
            owner_id = ${ownerId || null},
            branch_id = ${branchId || null},
            updated_at = now()
        WHERE id = ${id}
        RETURNING id, name, email, phone, role, status, owner_id, branch_id
      `

      if (role === 'owner') {
        const owner = await ensureOwnerRecord(updated.id, body.maxBranches)
        await sql`UPDATE users SET owner_id = ${owner.id}, updated_at = now() WHERE id = ${updated.id}`
      }

      if (body.maxBranches && isAdmin(authUser)) {
        const owner = await fetchOwnerByUserId(updated.id)
        if (owner) {
          await sql`
            UPDATE owners
            SET max_branches = ${parseInt(body.maxBranches, 10)}, updated_at = now()
            WHERE id = ${owner.id}
          `
        }
      }

      return json(200, { success: true, message: 'User updated', data: await buildUserResponse(updated) })
    } catch (err) {
      if (err?.code === '23505') {
        if (String(err?.constraint || '').includes('users_branch_role_unique')) {
          return json(409, { success: false, message: 'Branch already has this role assigned.' })
        }
        return json(409, { success: false, message: 'Email or phone already exists.' })
      }
      console.error('Update user error', err)
      return json(500, { success: false, message: 'Failed to update user' })
    }
  }

  // DELETE /api/users/:id
  if (request.method === 'DELETE' && /^\/[0-9]+$/.test(path)) {
    const authUser = await requireAuthUser(request)
    if (!authUser) return json(401, { success: false, message: 'Unauthorized' })
    if (!isAdmin(authUser) && !isOwner(authUser)) {
      return json(403, { success: false, message: 'Forbidden: admin/owner only' })
    }

    const id = parseId(path.replace('/', ''))
    if (!id) return json(400, { success: false, message: 'Invalid user id' })

    if (isOwner(authUser)) {
      const owner = await fetchOwnerByUserId(authUser.id)
      const ownerId = owner?.id
      const [target] = await sql`SELECT owner_id FROM users WHERE id = ${id} LIMIT 1`
      if (id !== authUser.id && (!ownerId || target?.owner_id !== ownerId)) {
        return json(403, { success: false, message: 'Forbidden' })
      }
    }

    await sql`DELETE FROM users WHERE id = ${id}`
    return json(200, { success: true, message: 'User deleted' })
  }

  return json(404, { success: false, message: 'Not found' })
}
