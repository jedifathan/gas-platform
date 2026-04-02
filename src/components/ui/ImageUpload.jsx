/**
 * ImageUpload — drag-and-drop / click to upload multiple images.
 * Uploads to POST /api/upload/images, returns URLs.
 *
 * Props:
 *   value      string[]   — current image URLs
 *   onChange   (urls) => void
 *   max        number     — max images (default 5)
 *   disabled   boolean
 */
import { useRef, useState } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { getToken } from '../../services/authService'

export default function ImageUpload({ value = [], onChange, max = 5, disabled = false }) {
  const inputRef          = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  async function handleFiles(files) {
    if (!files?.length) return
    const remaining = max - value.length
    if (remaining <= 0) { setError(`Maksimal ${max} gambar.`); return }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    setError('')

    try {
      const fd = new FormData()
      toUpload.forEach(f => fd.append('images', f))

      const res  = await fetch('/api/upload/images', {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    fd,
      })
      const data = await res.json()

      if (!data.success) { setError(data.message ?? 'Upload gagal.'); return }
      onChange([...value, ...data.urls])
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(url) {
    try {
      await fetch('/api/upload/images', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ url }),
      })
    } catch { /* best-effort delete */ }
    onChange(value.filter(u => u !== url))
  }

  function onDrop(e) {
    e.preventDefault()
    if (!disabled) handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      {value.length < max && (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${disabled || uploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
            disabled={disabled || uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 size={24} className="animate-spin text-primary-500" />
              <p className="text-sm">Mengunggah...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Upload size={24} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Klik atau seret gambar ke sini</p>
              <p className="text-xs">JPG, PNG, WebP · Maks. 5 MB per gambar · {value.length}/{max} gambar</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={url}
                alt={`Dokumentasi ${i + 1}`}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
              {/* Fallback icon if image fails */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0">
                <Image size={20} className="text-gray-400" />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity shadow-sm"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
