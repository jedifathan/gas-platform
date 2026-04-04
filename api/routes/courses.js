import { Router } from 'express'
import pool from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/courses — all published courses (teachers)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM courses ORDER BY order_num'
    )
    res.json(rows)
  } catch (err) {
    console.error('[GET /courses]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// GET /api/courses/:id — single course with lessons
router.get('/:id', async (req, res) => {
  try {
    const { rows: courseRows } = await pool.query(
      'SELECT * FROM courses WHERE id = $1', [req.params.id]
    )
    if (!courseRows.length) return res.status(404).json({ error: 'NOT_FOUND' })

    const { rows: lessonRows } = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index',
      [req.params.id]
    )
    res.json({ ...courseRows[0], lessons: lessonRows })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// POST /api/courses — create course (admin)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { title, month_label, description, passing_score, thumbnail_color } = req.body ?? {}
  if (!title?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'title', message: 'Judul wajib diisi.' })

  try {
    const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(order_num),0)+1 AS next FROM courses')
    const order_num = maxRow[0].next
    const id = `course-${Date.now().toString(36)}`
    await pool.query(
      `INSERT INTO courses (id, order_num, title, month_label, description, passing_score, thumbnail_color, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,false)`,
      [id, order_num, title.trim(), month_label||null, description||null, passing_score||70, thumbnail_color||'#DCFCE7']
    )
    const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1', [id])
    res.json({ success: true, course: rows[0] })
  } catch (err) {
    console.error('[POST /courses]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// PATCH /api/courses/:id — update course
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const { title, month_label, description, passing_score, thumbnail_color, is_published } = req.body ?? {}
  try {
    const { rows: existing } = await pool.query('SELECT * FROM courses WHERE id = $1', [id])
    if (!existing.length) return res.json({ success: false, error: 'NOT_FOUND' })
    const c = existing[0]
    await pool.query(
      `UPDATE courses SET title=$1, month_label=$2, description=$3, passing_score=$4,
       thumbnail_color=$5, is_published=$6 WHERE id=$7`,
      [
        title ?? c.title,
        month_label ?? c.month_label,
        description ?? c.description,
        passing_score ?? c.passing_score,
        thumbnail_color ?? c.thumbnail_color,
        is_published !== undefined ? is_published : c.is_published,
        id,
      ]
    )
    const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1', [id])
    res.json({ success: true, course: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// ── Lessons ───────────────────────────────────────────────────────────────────

// GET /api/courses/:id/lessons
router.get('/:id/lessons', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// POST /api/courses/:id/lessons — add lesson
router.post('/:id/lessons', requireAuth, requireRole('admin'), async (req, res) => {
  const { title, content_type, description, content_body, drive_file_id, duration_minutes, is_required } = req.body ?? {}
  if (!title?.trim())
    return res.json({ success: false, error: 'VALIDATION', field: 'title', message: 'Judul pelajaran wajib diisi.' })
  if (!['article','pdf','video','quiz'].includes(content_type))
    return res.json({ success: false, error: 'VALIDATION', field: 'content_type', message: 'Tipe konten tidak valid.' })

  try {
    const { rows: maxRow } = await pool.query(
      'SELECT COALESCE(MAX(order_index),0)+1 AS next FROM lessons WHERE course_id = $1',
      [req.params.id]
    )
    const order_index = maxRow[0].next
    const id = `les-${Date.now().toString(36)}`

    await pool.query(
      `INSERT INTO lessons (id, course_id, order_index, title, content_type, description,
       content_body, drive_file_id, duration_minutes, is_required)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, req.params.id, order_index, title.trim(), content_type,
       description||null, content_body||null, drive_file_id||null,
       duration_minutes||null, is_required !== false]
    )

    // Update total_lessons count on course
    await pool.query(
      'UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id=$1) WHERE id=$1',
      [req.params.id]
    )

    const { rows } = await pool.query('SELECT * FROM lessons WHERE id = $1', [id])
    res.json({ success: true, lesson: rows[0] })
  } catch (err) {
    console.error('[POST /courses/:id/lessons]', err)
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// PATCH /api/courses/:courseId/lessons/:lessonId
router.patch('/:courseId/lessons/:lessonId', requireAuth, requireRole('admin'), async (req, res) => {
  const { lessonId } = req.params
  const { title, content_type, description, content_body, drive_file_id, duration_minutes, is_required } = req.body ?? {}
  try {
    const { rows: existing } = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId])
    if (!existing.length) return res.json({ success: false, error: 'NOT_FOUND' })
    const l = existing[0]
    await pool.query(
      `UPDATE lessons SET title=$1, content_type=$2, description=$3, content_body=$4,
       drive_file_id=$5, duration_minutes=$6, is_required=$7 WHERE id=$8`,
      [
        title ?? l.title,
        content_type ?? l.content_type,
        description !== undefined ? description : l.description,
        content_body !== undefined ? content_body : l.content_body,
        drive_file_id !== undefined ? drive_file_id : l.drive_file_id,
        duration_minutes !== undefined ? duration_minutes : l.duration_minutes,
        is_required !== undefined ? is_required : l.is_required,
        lessonId,
      ]
    )
    const { rows } = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId])
    res.json({ success: true, lesson: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// DELETE /api/courses/:courseId/lessons/:lessonId
router.delete('/:courseId/lessons/:lessonId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.lessonId])
    await pool.query(
      'UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id=$1) WHERE id=$1',
      [req.params.courseId]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

export default router
