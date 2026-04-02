import { useState, useEffect, useCallback } from 'react'
import { MapPin, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { getAllRegions, createRegion, updateRegion, deleteRegion } from '../../services/regionService'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Button        from '../../components/ui/Button'
import Modal         from '../../components/ui/Modal'
import EmptyState    from '../../components/ui/EmptyState'
import Spinner       from '../../components/ui/Spinner'
import TextInput     from '../../components/forms/TextInput'

const EMPTY_FORM = { name: '', kota: '' }   // province → kota to match DB schema

export default function RegionManagement() {
  const { toast }                   = useApp()
  const [regions,  setRegions]      = useState([])
  const [loading,  setLoading]      = useState(true)
  const [search,   setSearch]       = useState('')
  const [modal,    setModal]        = useState(null)
  const [target,   setTarget]       = useState(null)
  const [form,     setForm]         = useState(EMPTY_FORM)
  const [errors,   setErrors]       = useState({})
  const [saving,   setSaving]       = useState(false)

  const fetchRegions = useCallback(async () => {
    setLoading(true)
    const data = await getAllRegions()
    setRegions(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchRegions() }, [fetchRegions])

  const filtered = regions.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.kota ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function openCreate() {
    setTarget(null); setForm(EMPTY_FORM); setErrors({}); setModal('create')
  }

  function openEdit(region) {
    setTarget(region)
    setForm({ name: region.name, kota: region.kota ?? '' })
    setErrors({})
    setModal('edit')
  }

  function openDelete(region) {
    setTarget(region); setModal('delete')
  }

  async function handleSave() {
    setSaving(true)
    const result = modal === 'create'
      ? await createRegion(form)
      : await updateRegion(target.id, form)
    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal menyimpan.')
      return
    }

    await fetchRegions()
    toast.success(modal === 'create' ? 'Wilayah berhasil ditambahkan.' : 'Wilayah berhasil diperbarui.')
    setModal(null)
  }

  async function handleDelete() {
    setSaving(true)
    const result = await deleteRegion(target.id)
    setSaving(false)

    if (!result.success) {
      toast.error(result.message ?? 'Gagal menghapus wilayah.')
      setModal(null)
      return
    }

    await fetchRegions()
    toast.success(`Wilayah "${target.name}" berhasil dihapus.`)
    setModal(null)
  }

  const isCreate   = modal === 'create'
  const linkedCount = target?.school_count ?? 0

  if (loading) return <Spinner center />

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">{regions.length} wilayah terdaftar</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
          Tambah Wilayah
        </Button>
      </div>

      <div className="mb-5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kota..." className="input pl-9 text-sm w-full" />
        </div>
      </div>

      <Card noPadding>
        {filtered.length === 0 ? (
          <EmptyState icon={<MapPin size={28} />} title="Tidak ada wilayah ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Nama Kecamatan</th>
                <th className="th">Kota</th>
                <th className="th w-28 text-center">Jumlah Sekolah</th>
                <th className="th w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(region => (
                <tr key={region.id} className="border-b border-gray-100 hover:bg-alabaster">
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{region.name}</span>
                    </div>
                  </td>
                  <td className="td text-sm text-gray-600">{region.kota ?? '—'}</td>
                  <td className="td text-center">
                    <span className={`text-sm font-semibold ${region.school_count > 0 ? 'text-primary-700' : 'text-gray-400'}`}>
                      {region.school_count ?? 0}
                    </span>
                  </td>
                  <td className="td text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" icon={<Edit2 size={12} />}
                        onClick={() => openEdit(region)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" icon={<Trash2 size={12} />}
                        onClick={() => openDelete(region)}
                        disabled={(region.school_count ?? 0) > 0}
                        title={(region.school_count ?? 0) > 0 ? `Tidak dapat dihapus — ${region.school_count} sekolah terdaftar` : 'Hapus wilayah'}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <p className="text-xs text-gray-400 mt-4">
        Wilayah yang memiliki sekolah terdaftar tidak dapat dihapus.
      </p>

      {/* Add / Edit Modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={isCreate ? 'Tambah Wilayah Baru' : `Edit Wilayah — ${target?.name}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {isCreate ? 'Tambah Wilayah' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput label="Nama Kecamatan" required value={form.name}
            onChange={e => set('name', e.target.value)} error={errors.name}
            placeholder="contoh: Pasar Rebo" />
          <TextInput label="Kota / Kabupaten" required value={form.kota}
            onChange={e => set('kota', e.target.value)} error={errors.kota}
            placeholder="contoh: Jakarta Timur" />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={modal === 'delete'}
        onClose={() => setModal(null)}
        title="Hapus Wilayah"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}
              disabled={linkedCount > 0}>
              Ya, Hapus
            </Button>
          </>
        }
      >
        {linkedCount > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Wilayah <strong>{target?.name}</strong> tidak dapat dihapus karena masih memiliki{' '}
              <strong className="text-red-600">{linkedCount} sekolah</strong> terdaftar.
            </p>
            <p className="text-xs text-gray-500">
              Pindahkan atau hapus semua sekolah di wilayah ini terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Hapus wilayah <strong>{target?.name}</strong> secara permanen?
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
