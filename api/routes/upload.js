/**
 * upload.js
 *
 * Two upload modes:
 *
 * 1. POST /api/upload/images  — teacher report documentation photos
 *    Saves to local Docker volume /app/uploads, served as /uploads/filename.jpg
 *    multipart/form-data, field: "images" (up to 5 files)
 *
 * 2. POST /api/upload/drive   — admin course materials (PDF/video)
 *    Uploads to Google Drive, returns drive_file_id for lesson embed
 *    multipart/form-data, field: "file" (single file)
 *    Body fields: courseId, lessonTitle, contentType
 *
 * 3. DELETE /api/upload/drive — delete a Drive file by ID
 *    Body: { fileId }
 */

import { Router }  from 'express'
import multer      from 'multer'
import path        from 'path'
import fs          from 'fs'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadFileToDrive, deleteFileFromDrive } from '../services/drive.js'

const router     = Router()
const UPLOAD_DIR = '/app/uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ── Storage for local images ──────────────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})
const imageUpload = multer({
  storage: diskStorage,
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.jpg','.jpeg','.png','.webp'].includes(ext)) cb(null, true)
    else cb(new Error('Hanya file gambar yang diizinkan.'))
  },
})

// ── Memory storage for Drive uploads (buffer → stream) ────────────────────────
const memStorage  = multer.memoryStorage()
const driveUpload = multer({
  storage: memStorage,
  limits:  { fileSize: 100 * 1024 * 1024 },   // 100 MB for videos
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = ['.pdf','.mp4','.mov','.avi','.mkv','.webm','.jpg','.jpeg','.png']
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Format file tidak didukung.'))
  },
})

// ── POST /api/upload/images — teacher report photos ───────────────────────────
router.post('/images', requireAuth, imageUpload.array('images', 5), (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' })
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ success: true, urls })
})

// ── DELETE /api/upload/images — delete a local image ─────────────────────────
router.delete('/images', requireAuth, (req, res) => {
  const { url } = req.body ?? {}
  if (!url?.startsWith('/uploads/'))
    return res.status(400).json({ success: false, message: 'URL tidak valid.' })
  const filepath = path.join(UPLOAD_DIR, path.basename(url))
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, message: 'Gagal menghapus file.' })
  }
})

// ── POST /api/upload/drive — admin course material upload to Google Drive ─────
router.post('/drive', requireAuth, requireRole('admin'), driveUpload.single('file'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' })

  const { courseId, lessonTitle, contentType } = req.body
  const ext      = path.extname(req.file.originalname).toLowerCase()
  const filename = `${courseId || 'course'}_${lessonTitle || 'material'}_${Date.now()}${ext}`

  try {
    const driveFile = await uploadFileToDrive(
      req.file.buffer,
      filename,
      req.file.mimetype,
    )
    res.json({
      success:       true,
      drive_file_id: driveFile.id,
      filename:      driveFile.name,
      view_link:     driveFile.webViewLink,
    })
  } catch (err) {
    console.error('[drive upload]', err.message)
    res.status(500).json({ success: false, message: 'Upload ke Google Drive gagal: ' + err.message })
  }
})

// ── DELETE /api/upload/drive — delete a Drive file ────────────────────────────
router.delete('/drive', requireAuth, requireRole('admin'), async (req, res) => {
  const { fileId } = req.body ?? {}
  if (!fileId)
    return res.status(400).json({ success: false, message: 'fileId wajib diisi.' })
  try {
    await deleteFileFromDrive(fileId)
    res.json({ success: true })
  } catch (err) {
    console.error('[drive delete]', err.message)
    res.status(500).json({ success: false, message: 'Gagal menghapus dari Drive.' })
  }
})

export default router
