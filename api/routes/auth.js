import { Router } from 'express'
import jwt    from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import pool   from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router     = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'gas_dev_secret'
const TOKEN_TTL  = '7d'

const PERMISSIONS = {
  admin:        ['reports:view','reports:validate','users:manage','schools:manage','regions:manage','monitoring:view','leaderboard:view'],
  teacher:      ['reports:submit','lms:access','certificate:view','profile:edit'],
  gov_observer: ['reports:view','monitoring:view','leaderboard:view','regions:view'],
}

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'Email dan password wajib diisi.' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.*,
         s.name      AS school_name,
         s.district  AS school_district,
         s.region_id AS school_region_id,
         r.name      AS region_name,
         r.kota      AS region_kota
       FROM users u
       LEFT JOIN schools s ON s.id = u.school_id
       LEFT JOIN regions r ON r.id = u.region_id
       WHERE u.email = $1`,
      [email.trim().toLowerCase()],
    )

    const user = rows[0]
    if (!user)        return res.json({ success: false, error: 'USER_NOT_FOUND',   message: 'Email tidak ditemukan.' })
    if (!user.is_active) return res.json({ success: false, error: 'ACCOUNT_DISABLED', message: 'Akun ini telah dinonaktifkan.' })

    // Support both bcrypt hashes AND plain text (for migration period)
    const passwordMatch = user.password.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : user.password === password

    if (!passwordMatch) return res.json({ success: false, error: 'INVALID_PASSWORD', message: 'Password salah.' })

    // If password was plain text, upgrade it to bcrypt on successful login
    if (!user.password.startsWith('$2b$')) {
      const hash = await bcrypt.hash(password, 12)
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, user.id])
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const session = {
      user_id:     user.id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      school_id:   user.school_id  ?? null,
      region_id:   user.region_id  ?? null,
      school:      user.school_id
                     ? { id: user.school_id, name: user.school_name, district: user.school_district, region_id: user.school_region_id }
                     : null,
      region:      user.region_id
                     ? { id: user.region_id, name: user.region_name, kota: user.region_kota }
                     : null,
      permissions: PERMISSIONS[user.role] ?? [],
      last_login:  new Date().toISOString(),
    }

    const token = jwt.sign({ user_id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL })
    res.json({ success: true, session, token })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Terjadi kesalahan server.' })
  }
})

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.*, s.name AS school_name, s.district AS school_district, s.region_id AS school_region_id,
              r.name AS region_name, r.kota AS region_kota
       FROM users u
       LEFT JOIN schools s ON s.id = u.school_id
       LEFT JOIN regions r ON r.id = u.region_id
       WHERE u.id = $1`,
      [req.user.user_id],
    )
    const user = rows[0]
    if (!user || !user.is_active) return res.status(401).json({ error: 'UNAUTHORIZED' })
    res.json({ success: true, user_id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    console.error('[me]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

export default router
