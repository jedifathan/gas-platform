import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/schools — all schools, optionally filtered by region_id
router.get('/', async (req, res) => {
  try {
    const { region_id } = req.query
    const query = region_id
      ? `SELECT s.*, r.name AS region_name, r.kota AS region_kota
         FROM schools s LEFT JOIN regions r ON r.id = s.region_id
         WHERE s.region_id = $1 ORDER BY s.name`
      : `SELECT s.*, r.name AS region_name, r.kota AS region_kota
         FROM schools s LEFT JOIN regions r ON r.id = s.region_id
         ORDER BY s.district, s.name`
    const { rows } = await pool.query(query, region_id ? [region_id] : [])
    res.json(rows.map(s => ({
      id:             s.id,
      name:           s.name,
      district:       s.district,
      region_id:      s.region_id,
      address:        s.address,
      total_students: s.total_students,
      total_teachers: s.total_teachers,
      is_active:      s.is_active,
      region: s.region_id ? { id: s.region_id, name: s.region_name, kota: s.region_kota } : null,
    })))
  } catch (err) {
    console.error('[GET /schools]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// GET /api/schools/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, r.name AS region_name, r.kota AS region_kota
       FROM schools s LEFT JOIN regions r ON r.id = s.region_id
       WHERE s.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })
    const s = rows[0]
    res.json({
      id: s.id, name: s.name, district: s.district, region_id: s.region_id,
      address: s.address, total_students: s.total_students, total_teachers: s.total_teachers,
      is_active: s.is_active,
      region: s.region_id ? { id: s.region_id, name: s.region_name, kota: s.region_kota } : null,
    })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// POST /api/schools
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, district, region_id, address, total_students, total_teachers } = req.body ?? {}
  if (!name?.trim()) return res.json({ success: false, error: 'VALIDATION', field: 'name', message: 'Nama sekolah wajib diisi.' })
  if (!region_id)    return res.json({ success: false, error: 'VALIDATION', field: 'region_id', message: 'Wilayah wajib dipilih.' })
  try {
    const id = `sch-${Date.now().toString(36)}`
    await pool.query(
      `INSERT INTO schools (id, name, district, region_id, address, total_students, total_teachers)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, name.trim(), district || null, region_id, address || null, total_students || null, total_teachers || null]
    )
    const { rows } = await pool.query(
      `SELECT s.*, r.name AS region_name, r.kota AS region_kota FROM schools s
       LEFT JOIN regions r ON r.id = s.region_id WHERE s.id = $1`, [id]
    )
    const s = rows[0]
    res.json({ success: true, school: { id: s.id, name: s.name, district: s.district, region_id: s.region_id, region: { id: s.region_id, name: s.region_name, kota: s.region_kota } } })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// PATCH /api/schools/:id
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const { name, district, region_id, address, total_students, total_teachers } = req.body ?? {}
  try {
    const { rows: existing } = await pool.query('SELECT * FROM schools WHERE id = $1', [id])
    if (!existing.length) return res.json({ success: false, error: 'NOT_FOUND' })
    const s = existing[0]
    await pool.query(
      `UPDATE schools SET name=$1, district=$2, region_id=$3, address=$4, total_students=$5, total_teachers=$6 WHERE id=$7`,
      [name ?? s.name, district ?? s.district, region_id ?? s.region_id, address ?? s.address, total_students ?? s.total_students, total_teachers ?? s.total_teachers, id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

export default router
