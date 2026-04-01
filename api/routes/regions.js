import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/regions
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, COUNT(s.id)::int AS school_count
       FROM regions r LEFT JOIN schools s ON s.region_id = r.id
       GROUP BY r.id ORDER BY r.kota, r.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// GET /api/regions/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, COUNT(s.id)::int AS school_count
       FROM regions r LEFT JOIN schools s ON s.region_id = r.id
       WHERE r.id = $1 GROUP BY r.id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// POST /api/regions
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, kota } = req.body ?? {}
  if (!name?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'name', message: 'Nama wilayah wajib diisi.' })

  try {
    const dup = await pool.query('SELECT id FROM regions WHERE name = $1', [name.trim()])
    if (dup.rows.length)
      return res.json({ success: false, error: 'DUPLICATE_NAME', message: 'Nama wilayah sudah terdaftar.' })

    const id = `reg-${Date.now().toString(36)}`
    await pool.query(
      'INSERT INTO regions (id, name, kota) VALUES ($1,$2,$3)',
      [id, name.trim(), kota || null]
    )
    const { rows } = await pool.query('SELECT * FROM regions WHERE id = $1', [id])
    res.json({ success: true, region: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// PATCH /api/regions/:id
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const { name, kota } = req.body ?? {}
  try {
    const { rows: existing } = await pool.query('SELECT * FROM regions WHERE id = $1', [id])
    if (!existing.length) return res.json({ success: false, error: 'NOT_FOUND' })
    const r = existing[0]
    await pool.query(
      'UPDATE regions SET name=$1, kota=$2 WHERE id=$3',
      [name ?? r.name, kota ?? r.kota, id]
    )
    const { rows } = await pool.query('SELECT * FROM regions WHERE id = $1', [id])
    res.json({ success: true, region: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// DELETE /api/regions/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  try {
    const { rows: linked } = await pool.query('SELECT id FROM schools WHERE region_id = $1', [id])
    if (linked.length)
      return res.json({
        success: false,
        error: 'HAS_SCHOOLS',
        message: `Wilayah tidak dapat dihapus karena masih memiliki ${linked.length} sekolah terdaftar.`
      })
    await pool.query('DELETE FROM regions WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

export default router
