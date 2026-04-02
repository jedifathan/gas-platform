/**
 * upload.js — file upload endpoint for report documentation images.
 *
 * Strategy: save to /app/uploads/ (Docker volume), serve via nginx.
 * Google Drive integration: add your Drive service account credentials
 * to .env and uncomment the Drive section below.
 *
 * POST /api/upload/images
 *   multipart/form-data, field: "images" (multiple)
 *   Returns: { success, urls: ["/uploads/filename.jpg", ...] }
 *
 * DELETE /api/upload/images
 *   Body: { url: "/uploads/filename.jpg" }
 */

import { Router }  from 'express'
import multer      from 'multer'
import path        from 'path'
import fs          from 'fs'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// ── Storage config ────────────────────────────────────────────────────────────
const UPLOAD_DIR = '/app/uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB per file
  fileFilter: (_, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Hanya file gambar (JPG, PNG, WebP) yang diizinkan.'))
  },
})

// POST /api/upload/images — upload 1–5 images
router.post('/images', requireAuth, upload.array('images', 5), (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' })

  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ success: true, urls })
})

// DELETE /api/upload/images — delete a single uploaded file
router.delete('/images', requireAuth, (req, res) => {
  const { url } = req.body ?? {}
  if (!url?.startsWith('/uploads/'))
    return res.status(400).json({ success: false, message: 'URL tidak valid.' })

  const filename = path.basename(url)
  const filepath = path.join(UPLOAD_DIR, filename)

  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, message: 'Gagal menghapus file.' })
  }
})

export default router
