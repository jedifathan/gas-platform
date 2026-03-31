import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

function uid() {
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// Shared SELECT with JOINs — keeps queries DRY
const BASE_SELECT = `
  SELECT
    u.id, u.name, u.email, u.role,
    u.school_id, u.region_id,
    u.is_active, u.created_at, u.last_login,
    s.name      AS school_name,
    s.district  AS school_district,
    s.region_id AS school_region_id,
    r.name      AS region_name,
    r.kota  AS region_kota
  FROM users u
  LEFT JOIN schools s ON s.id = u.school_id
  LEFT JOIN regions r ON r.id = u.region_id
`

function rowToUser(row) {
  return {
    id:         row.id,
    name:       row.name,
    email:      row.email,
    role:       row.role,
    school_id:  row.school_id  ?? null,
    region_id:  row.region_id  ?? null,
    is_active:  row.is_active,
    created_at: row.created_at,
    last_login: row.last_login,
    school:     row.school_id
                  ? { id: row.school_id, name: row.school_name, district: row.school_district, region_id: row.school_region_id }
                  : null,
    region:     row.region_id
                  ? { id: row.region_id, name: row.region_name, kota: row.region_kota }
                  : null,
    // password is never returned
  }
}

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(BASE_SELECT + ' ORDER BY u.created_at DESC')
    res.json(rows.map(rowToUser))
  } catch (err) {
    console.error('[GET /users]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(BASE_SELECT + ' WHERE u.id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })
    res.json(rowToUser(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// ── POST /api/users ───────────────────────────────────────────────────────────
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, school_id, region_id } = req.body ?? {}

  if (!name?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'name',     message: 'Nama wajib diisi.' })
  if (!email?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'email',    message: 'Email wajib diisi.' })
  if (!password || password.length < 6)
    return res.json({ success: false, error: 'VALIDATION', field: 'password', message: 'Password minimal 6 karakter.' })
  if (!['teacher', 'gov_observer', 'admin'].includes(role))
    return res.json({ success: false, error: 'VALIDATION', field: 'role',     message: 'Role tidak valid.' })

  try {
    const dup = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (dup.rows.length)
      return res.json({ success: false, error: 'DUPLICATE_EMAIL', message: 'Email sudah terdaftar.' })

    const id = uid()
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, school_id, region_id, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
      [id, name.trim(), email.trim().toLowerCase(), password, role, school_id || null, region_id || null],
    )

    const { rows } = await pool.query(BASE_SELECT + ' WHERE u.id = $1', [id])
    res.json({ success: true, user: rowToUser(rows[0]) })
  } catch (err) {
    console.error('[POST /users]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// ── PATCH /api/users/:id ──────────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const data    = req.body ?? {}

  try {
    const existing = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (!existing.rows.length) return res.json({ success: false, error: 'NOT_FOUND' })

    const u = existing.rows[0]

    const name     = data.name?.trim()     || u.name
    const email    = data.email?.trim()    || u.email
    const password = data.password?.trim() || u.password
    const role     = ['teacher','gov_observer','admin'].includes(data.role) ? data.role : u.role

    // Clear irrelevant FK fields when role changes (mirrors old authService logic)
    let school_id = u.school_id
    let region_id = u.region_id
    if (role === 'admin')        { school_id = null;                                     region_id = null }
    else if (role === 'teacher') { school_id = data.school_id ?? school_id;              region_id = null }
    else if (role === 'gov_observer') { school_id = null; region_id = data.region_id ?? region_id }

    await pool.query(
      `UPDATE users
       SET name=$1, email=$2, password=$3, role=$4, school_id=$5, region_id=$6
       WHERE id=$7`,
      [name, email.toLowerCase(), password, role, school_id, region_id, id],
    )

    const { rows } = await pool.query(BASE_SELECT + ' WHERE u.id = $1', [id])
    res.json({ success: true, user: rowToUser(rows[0]) })
  } catch (err) {
    console.error('[PATCH /users/:id]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// ── PATCH /api/users/:id/toggle ───────────────────────────────────────────────
router.patch('/:id/toggle', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query('SELECT role, is_active FROM users WHERE id = $1', [id])
    if (!rows.length)
      return res.json({ success: false, error: 'USER_NOT_FOUND' })
    if (rows[0].role === 'admin')
      return res.json({ success: false, error: 'CANNOT_DEACTIVATE_ADMIN', message: 'Admin tidak dapat dinonaktifkan.' })

    const newStatus = !rows[0].is_active
    await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id])
    res.json({ success: true, user_id: id, is_active: newStatus })
  } catch (err) {
    console.error('[PATCH /users/:id/toggle]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

export default router
