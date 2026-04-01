import { Router } from 'express'
import bcrypt from 'bcrypt'
import pool from '../db.js'

const router = Router()

function uid() {
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * POST /api/auth/signup
 * Public endpoint — only allows teacher and gov_observer roles.
 * Admin accounts must be created by an existing admin.
 */
router.post('/', async (req, res) => {
  const { name, email, password, role, school_id, region_id } = req.body ?? {}

  // Validation
  if (!name?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'name', message: 'Nama wajib diisi.' })
  if (!email?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'email', message: 'Email wajib diisi.' })
  if (!password || password.length < 6)
    return res.json({ success: false, error: 'VALIDATION', field: 'password', message: 'Password minimal 6 karakter.' })
  if (!['teacher', 'gov_observer'].includes(role))
    return res.json({ success: false, error: 'VALIDATION', field: 'role', message: 'Role tidak valid. Pilih Guru atau Pengamat Dinas.' })
  if (role === 'teacher' && !school_id)
    return res.json({ success: false, error: 'VALIDATION', field: 'school_id', message: 'Guru wajib memilih sekolah.' })
  if (role === 'gov_observer' && !region_id)
    return res.json({ success: false, error: 'VALIDATION', field: 'region_id', message: 'Pengamat Dinas wajib memilih wilayah.' })

  try {
    // Check duplicate email
    const dup = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (dup.rows.length)
      return res.json({ success: false, error: 'DUPLICATE_EMAIL', message: 'Email sudah terdaftar.' })

    // Validate school/region exists
    if (role === 'teacher') {
      const { rows } = await pool.query('SELECT id FROM schools WHERE id = $1', [school_id])
      if (!rows.length)
        return res.json({ success: false, error: 'VALIDATION', field: 'school_id', message: 'Sekolah tidak ditemukan.' })
    }
    if (role === 'gov_observer') {
      const { rows } = await pool.query('SELECT id FROM regions WHERE id = $1', [region_id])
      if (!rows.length)
        return res.json({ success: false, error: 'VALIDATION', field: 'region_id', message: 'Wilayah tidak ditemukan.' })
    }

    const id   = uid()
    const hash = await bcrypt.hash(password, 12)

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, school_id, region_id, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
      [
        id,
        name.trim(),
        email.trim().toLowerCase(),
        hash,
        role,
        role === 'teacher'      ? school_id  : null,
        role === 'gov_observer' ? region_id  : null,
      ]
    )

    res.json({ success: true, message: 'Akun berhasil dibuat. Silakan masuk.' })
  } catch (err) {
    console.error('[POST /auth/signup]', err)
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Terjadi kesalahan server.' })
  }
})

export default router
