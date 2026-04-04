import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Plus, Edit2, ChevronDown, ChevronUp, Trash2,
         FileText, Video, HelpCircle, Eye, EyeOff, GripVertical,
         Upload, Loader2, ExternalLink } from 'lucide-react'
import { useApp }   from '../../hooks/useApp'
import Card         from '../../components/ui/Card'
import Button       from '../../components/ui/Button'
import Modal        from '../../components/ui/Modal'
import Badge        from '../../components/ui/Badge'
import Spinner      from '../../components/ui/Spinner'
import EmptyState   from '../../components/ui/EmptyState'
import TextInput    from '../../components/forms/TextInput'
import TextArea     from '../../components/forms/TextArea'
import SelectInput  from '../../components/forms/SelectInput'
import { getToken } from '../../services/authService'

const BASE = '/api'
function authHeaders(isJson = true) {
  const h = { Authorization: `Bearer ${getToken()}` }
  if (isJson) h['Content-Type'] = 'application/json'
  return h
}

const CONTENT_TYPE_OPTS = [
  { value: 'article', label: 'Artikel (teks)' },
  { value: 'pdf',     label: 'PDF (Google Drive)' },
  { value: 'video',   label: 'Video (Google Drive)' },
  { value: 'quiz',    label: 'Kuis Evaluasi' },
]
const CONTENT_ICONS = {
  article: <FileText   size={14} className="text-blue-500" />,
  pdf:     <FileText   size={14} className="text-red-500"  />,
  video:   <Video      size={14} className="text-purple-500" />,
  quiz:    <HelpCircle size={14} className="text-amber-500" />,
}
const COLOR_OPTS = [
  { value: '#DCFCE7', label: '🟢 Hijau muda'  },
  { value: '#DBEAFE', label: '🔵 Biru muda'   },
  { value: '#FEF9C3', label: '🟡 Kuning muda' },
  { value: '#FCE7F3', label: '🩷 Pink muda'   },
  { value: '#FEE2E2', label: '🔴 Merah muda'  },
  { value: '#EDE9FE', label: '🟣 Ungu muda'   },
  { value: '#FFF7ED', label: '🟠 Oranye muda' },
  { value: '#F0FDF4', label: '🌿 Hijau segar' },
]

const EMPTY_COURSE = { title: '', month_label: '', description: '', passing_score: 70, thumbnail_color: '#DCFCE7' }
const EMPTY_LESSON = { title: '', content_type: 'article', description: '', content_body: '', drive_file_id: '', duration_minutes: '' }

export default function CourseManagement() {
  const { toast }           = useApp()
  const [courses,   setCourses]  = useState([])
  const [loading,   setLoading]  = useState(true)
  const [expanded,  setExpanded] = useState({})

  // Course modal
  const [courseModal,   setCourseModal]   = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseForm,    setCourseForm]    = useState(EMPTY_COURSE)
  const [courseSaving,  setCourseSaving]  = useState(false)

  // Lesson modal
  const [lessonModal,    setLessonModal]    = useState(null)
  const [lessonCourseId, setLessonCourseId] = useState(null)
  const [editingLesson,  setEditingLesson]  = useState(null)
  const [lessonForm,     setLessonForm]     = useState(EMPTY_LESSON)
  const [lessonSaving,   setLessonSaving]   = useState(false)

  // Drive upload
  const fileInputRef    = useRef(null)
  const [uploading,     setUploading]     = useState(false)
  const [driveViewLink, setDriveViewLink] = useState('')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/courses`, { headers: authHeaders() })
      const data = await res.json()
      const withLessons = await Promise.all(data.map(async c => {
        const lr      = await fetch(`${BASE}/courses/${c.id}/lessons`, { headers: authHeaders() })
        const lessons = await lr.json()
        return { ...c, lessons }
      }))
      setCourses(withLessons)
    } catch { toast.error('Gagal memuat kursus.') }
    finally  { setLoading(false) }
  }, []) // eslint-disable-line

  useEffect(() => { fetchCourses() }, [fetchCourses])

  // ── Course actions ──────────────────────────────────────────────────────────
  function openCreateCourse() {
    setEditingCourse(null); setCourseForm(EMPTY_COURSE); setCourseModal('create')
  }
  function openEditCourse(c) {
    setEditingCourse(c)
    setCourseForm({ title: c.title, month_label: c.month_label||'', description: c.description||'',
                    passing_score: c.passing_score||70, thumbnail_color: c.thumbnail_color||'#DCFCE7' })
    setCourseModal('edit')
  }
  async function saveCourse() {
    setCourseSaving(true)
    const url    = courseModal === 'create' ? `${BASE}/courses` : `${BASE}/courses/${editingCourse.id}`
    const method = courseModal === 'create' ? 'POST' : 'PATCH'
    const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(courseForm) })
    const data   = await res.json()
    setCourseSaving(false)
    if (!data.success) { toast.error(data.message ?? 'Gagal menyimpan.'); return }
    await fetchCourses()
    toast.success(courseModal === 'create' ? 'Kursus berhasil dibuat.' : 'Kursus berhasil diperbarui.')
    setCourseModal(null)
  }
  async function togglePublish(course) {
    const res  = await fetch(`${BASE}/courses/${course.id}`, {
      method: 'PATCH', headers: authHeaders(),
      body:   JSON.stringify({ is_published: !course.is_published }),
    })
    const data = await res.json()
    if (data.success) {
      await fetchCourses()
      toast.success(course.is_published ? 'Kursus disembunyikan.' : 'Kursus dipublikasikan.')
    }
  }

  // ── Lesson actions ──────────────────────────────────────────────────────────
  function openCreateLesson(courseId) {
    setLessonCourseId(courseId); setEditingLesson(null)
    setLessonForm(EMPTY_LESSON); setDriveViewLink(''); setLessonModal('create')
  }
  function openEditLesson(courseId, lesson) {
    setLessonCourseId(courseId); setEditingLesson(lesson)
    setLessonForm({
      title:            lesson.title,
      content_type:     lesson.content_type,
      description:      lesson.description      || '',
      content_body:     lesson.content_body     || '',
      drive_file_id:    lesson.drive_file_id    || '',
      duration_minutes: lesson.duration_minutes || '',
    })
    setDriveViewLink(lesson.drive_file_id
      ? `https://drive.google.com/file/d/${lesson.drive_file_id}/view`
      : '')
    setLessonModal('edit')
  }
  async function saveLesson() {
    setLessonSaving(true)
    const url    = lessonModal === 'create'
      ? `${BASE}/courses/${lessonCourseId}/lessons`
      : `${BASE}/courses/${lessonCourseId}/lessons/${editingLesson.id}`
    const method = lessonModal === 'create' ? 'POST' : 'PATCH'
    const body   = {
      ...lessonForm,
      drive_file_id:    lessonForm.drive_file_id    || null,
      duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : null,
    }
    const res  = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    setLessonSaving(false)
    if (!data.success) { toast.error(data.message ?? 'Gagal menyimpan.'); return }
    await fetchCourses()
    toast.success(lessonModal === 'create' ? 'Pelajaran ditambahkan.' : 'Pelajaran diperbarui.')
    setLessonModal(null)
  }
  async function deleteLesson(courseId, lessonId) {
    if (!confirm('Hapus pelajaran ini?')) return
    const res  = await fetch(`${BASE}/courses/${courseId}/lessons/${lessonId}`, {
      method: 'DELETE', headers: authHeaders(),
    })
    const data = await res.json()
    if (data.success) { await fetchCourses(); toast.success('Pelajaran dihapus.') }
    else toast.error('Gagal menghapus.')
  }

  // ── Drive file upload ───────────────────────────────────────────────────────
  async function handleDriveUpload(file) {
    if (!file) return
    setUploading(true)
    const course = courses.find(c => c.id === lessonCourseId)
    const fd = new FormData()
    fd.append('file',         file)
    fd.append('courseId',     lessonCourseId || '')
    fd.append('lessonTitle',  lessonForm.title || 'material')
    fd.append('contentType',  lessonForm.content_type)

    try {
      const res  = await fetch(`${BASE}/upload/drive`, {
        method:  'POST',
        headers: authHeaders(false),   // no Content-Type — browser sets multipart boundary
        body:    fd,
      })
      const data = await res.json()
      if (!data.success) { toast.error(data.message ?? 'Upload gagal.'); return }
      setLessonForm(f => ({ ...f, drive_file_id: data.drive_file_id }))
      setDriveViewLink(data.view_link)
      toast.success('File berhasil diunggah ke Google Drive.')
    } catch {
      toast.error('Tidak dapat terhubung ke server.')
    } finally {
      setUploading(false)
    }
  }

  function setCF(k, v) { setCourseForm(f => ({ ...f, [k]: v })) }
  function setLF(k, v) { setLessonForm(f => ({ ...f, [k]: v })) }
  function toggleExpand(id) { setExpanded(e => ({ ...e, [id]: !e[id] })) }

  if (loading) return <Spinner center />

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Kursus</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} kursus terdaftar</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreateCourse}>
          Tambah Kursus
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card><EmptyState icon={<BookOpen size={28} />} title="Belum ada kursus" compact /></Card>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <Card key={course.id} noPadding>
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: course.thumbnail_color || '#DCFCE7' }}>
                  <BookOpen size={18} className="text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                    <Badge color={course.is_published ? 'green' : 'gray'} size="sm">
                      {course.is_published ? 'Publik' : 'Draft'}
                    </Badge>
                    {course.month_label && <span className="text-xs text-gray-400">{course.month_label}</span>}
                  </div>
                  <p className="text-xs text-gray-400">
                    {course.lessons?.length ?? 0} pelajaran · Lulus ≥{course.passing_score}%
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost"
                    icon={course.is_published ? <EyeOff size={13}/> : <Eye size={13}/>}
                    onClick={() => togglePublish(course)}>
                    {course.is_published ? 'Sembunyikan' : 'Publikasikan'}
                  </Button>
                  <Button size="sm" variant="secondary" icon={<Edit2 size={12}/>}
                    onClick={() => openEditCourse(course)}>Edit</Button>
                  <Button size="sm" variant="ghost"
                    icon={expanded[course.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    onClick={() => toggleExpand(course.id)}>
                    Pelajaran
                  </Button>
                </div>
              </div>

              {expanded[course.id] && (
                <div className="border-t border-gray-100">
                  {(course.lessons ?? []).map(lesson => (
                    <div key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-alabaster group">
                      <GripVertical size={14} className="text-gray-300 shrink-0" />
                      <span className="shrink-0">{CONTENT_ICONS[lesson.content_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400 capitalize">{lesson.content_type}</span>
                          {lesson.drive_file_id && (
                            <span className="text-xs text-primary-600 flex items-center gap-1">
                              <ExternalLink size={10} /> Drive terhubung
                            </span>
                          )}
                          {lesson.duration_minutes && (
                            <span className="text-xs text-gray-400">{lesson.duration_minutes} mnt</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" icon={<Edit2 size={11}/>}
                          onClick={() => openEditLesson(course.id, lesson)}>Edit</Button>
                        <Button size="sm" variant="danger" icon={<Trash2 size={11}/>}
                          onClick={() => deleteLesson(course.id, lesson.id)}>Hapus</Button>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-3">
                    <Button size="sm" variant="ghost" icon={<Plus size={13}/>}
                      onClick={() => openCreateLesson(course.id)}>
                      Tambah Pelajaran
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Course modal */}
      <Modal open={!!courseModal} onClose={() => setCourseModal(null)}
        title={courseModal === 'create' ? 'Tambah Kursus Baru' : `Edit Kursus — ${editingCourse?.title}`}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setCourseModal(null)}>Batal</Button>
          <Button variant="primary" loading={courseSaving} onClick={saveCourse}>
            {courseModal === 'create' ? 'Buat Kursus' : 'Simpan'}
          </Button>
        </>}
      >
        <div className="space-y-4">
          <TextInput label="Judul Kursus" required value={courseForm.title}
            onChange={e => setCF('title', e.target.value)} placeholder="contoh: Petualangan Gigi" />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Bulan Pelaksanaan" value={courseForm.month_label}
              onChange={e => setCF('month_label', e.target.value)} placeholder="contoh: Juli 2025" />
            <TextInput label="Nilai Lulus (%)" type="number" min="1" max="100"
              value={courseForm.passing_score}
              onChange={e => setCF('passing_score', parseInt(e.target.value))} />
          </div>
          <TextArea label="Deskripsi" rows={3} value={courseForm.description}
            onChange={e => setCF('description', e.target.value)}
            placeholder="Deskripsi singkat kursus ini..." />
          <SelectInput label="Warna Kartu" options={COLOR_OPTS} value={courseForm.thumbnail_color}
            onChange={e => setCF('thumbnail_color', e.target.value)} placeholder={null} />
        </div>
      </Modal>

      {/* Lesson modal */}
      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)}
        title={lessonModal === 'create' ? 'Tambah Pelajaran' : `Edit — ${editingLesson?.title}`}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setLessonModal(null)}>Batal</Button>
          <Button variant="primary" loading={lessonSaving} onClick={saveLesson}>
            {lessonModal === 'create' ? 'Tambah' : 'Simpan'}
          </Button>
        </>}
      >
        <div className="space-y-4">
          <TextInput label="Judul Pelajaran" required value={lessonForm.title}
            onChange={e => setLF('title', e.target.value)} placeholder="contoh: Materi Utama" />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput label="Tipe Konten" required options={CONTENT_TYPE_OPTS}
              value={lessonForm.content_type}
              onChange={e => { setLF('content_type', e.target.value); setDriveViewLink('') }}
              placeholder={null} />
            <TextInput label="Durasi (menit)" type="number" min="1"
              value={lessonForm.duration_minutes}
              onChange={e => setLF('duration_minutes', e.target.value)} placeholder="contoh: 15" />
          </div>

          <TextArea label="Deskripsi / Pengantar" rows={2} value={lessonForm.description}
            onChange={e => setLF('description', e.target.value)}
            placeholder="Teks pengantar yang tampil di atas materi..." />

          {lessonForm.content_type === 'article' && (
            <TextArea label="Isi Artikel" rows={8} value={lessonForm.content_body}
              onChange={e => setLF('content_body', e.target.value)}
              placeholder="Tulis konten artikel. Gunakan **teks** untuk judul, - untuk list." />
          )}

          {(lessonForm.content_type === 'pdf' || lessonForm.content_type === 'video') && (
            <div className="space-y-3">
              {/* Option 1: Upload file directly */}
              <div>
                <label className="label mb-2 block">
                  Upload {lessonForm.content_type === 'pdf' ? 'PDF' : 'Video'} ke Google Drive
                </label>
                <input ref={fileInputRef} type="file" className="hidden"
                  accept={lessonForm.content_type === 'pdf' ? '.pdf' : '.mp4,.mov,.avi,.mkv,.webm'}
                  onChange={e => handleDriveUpload(e.target.files?.[0])} />
                <Button variant="secondary" icon={uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}>
                  {uploading ? 'Mengunggah ke Drive...' : `Pilih file ${lessonForm.content_type.toUpperCase()}`}
                </Button>
              </div>

              {/* OR: paste Drive ID manually */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">atau paste ID manual</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <TextInput label="Google Drive File ID" value={lessonForm.drive_file_id}
                onChange={e => { setLF('drive_file_id', e.target.value); setDriveViewLink('') }}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                hint="Dari URL Drive: drive.google.com/file/d/[FILE_ID]/view" />

              {/* Status */}
              {(lessonForm.drive_file_id || driveViewLink) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 border border-primary-200">
                  <ExternalLink size={14} className="text-primary-600 shrink-0" />
                  <p className="text-xs text-primary-700 flex-1">
                    File ID: <span className="font-mono">{lessonForm.drive_file_id}</span>
                  </p>
                  {driveViewLink && (
                    <a href={driveViewLink} target="_blank" rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline shrink-0">
                      Lihat di Drive →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
