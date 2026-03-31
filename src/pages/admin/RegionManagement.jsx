import { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { getAllRegions, createRegion, updateRegion, deleteRegion } from '../../services/regionService'
import schoolsData from '../../data/schools.json'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Button        from '../../components/ui/Button'
import Modal         from '../../components/ui/Modal'
import EmptyState    from '../../components/ui/EmptyState'
import TextInput     from '../../components/forms/TextInput'
import { formatDate } from '../../utils/formatters'

const EMPTY_FORM = { name: '', province: '' }

export default function RegionManagement() {
  const { toast }                    = useApp()
  const [regions, setRegions]        = useState(() => getAllRegions())
  const [search,  setSearch]         = useState('')
  const [modal,   setModal]          = useState(null)   // 'create' | 'edit' | 'delete' | null
  const [target,  setTarget]         = useState(null)   // region being edited/deleted
  const [form,    setForm]           = useState(EMPTY_FORM)
  const [errors,  setErrors]         = useState({})
  const [saving,  setSaving]         = useState(false)

  const filtered = regions.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.province.toLowerCase().includes(search.toLowerCase())
  )

  // Count schools per region for display + delete guard
  function schoolCount(regionId) {
    return schoolsData.filter(s => s.region_id === regionId).length
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function openCreate() {
    setTarget(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModal('create')
  }

  function openEdit(region) {
    setTarget(region)
    setForm({ name: region.name, province: region.province })
    setErrors({})
    setModal('edit')
  }

  function openDelete(region) {
    setTarget(region)
    setModal('delete')
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const result = modal === 'create'
      ? createRegion(form)
      : updateRegion(target.id, form)

    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal menyimpan.')
      return
    }

    setRegions(getAllRegions())
    toast.success(modal === 'create' ? 'Wilayah berhasil ditambahkan.' : 'Wilayah berhasil diperbarui.')
    setModal(null)
  }

  async function handleDelete() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))

    const result = deleteRegion(target.id, schoolsData)
    setSaving(false)

    if (!result.success) {
      toast.error(result.message ?? 'Gagal menghapus wilayah.')
      setModal(null)
      return
    }

    setRegions(getAllRegions())
    toast.success(`Wilayah "${target.name}" berhasil dihapus.`)
    setModal(null)
  }

  const isCreate = modal === 'create'
  const linkedCount = target ? schoolCount(target.id) : 0

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

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau provinsi..." className="input pl-9 text-sm w-full" />
        </div>
      </div>

      {/* Table */}
      <Card noPadding>
        {filtered.length === 0 ? (
          <EmptyState icon={<MapPin size={28} />} title="Tidak ada wilayah ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Nama Wilayah</th>
                <th className="th">Provinsi</th>
                <th className="th w-28 text-center">Jumlah Sekolah</th>
                <th className="th w-32">Ditambahkan</th>
                <th className="th w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((region, i) => {
                const sc = schoolCount(region.id)
                return (
                  <tr key={region.id}
                    className="border-b border-gray-100 hover:bg-alabaster">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{region.name}</span>
                      </div>
                    </td>
                    <td className="td text-sm text-gray-600">{region.province}</td>
                    <td className="td text-center">
                      <span className={`text-sm font-semibold ${sc > 0 ? 'text-primary-700' : 'text-gray-400'}`}>
                        {sc}
                      </span>
                    </td>
                    <td className="td text-xs text-gray-500">{formatDate(region.created_at)}</td>
                    <td className="td text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" icon={<Edit2 size={12} />}
                          onClick={() => openEdit(region)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={<Trash2 size={12} />}
                          onClick={() => openDelete(region)}
                          disabled={sc > 0}
                          title={sc > 0 ? `Tidak dapat dihapus — ${sc} sekolah terdaftar` : 'Hapus wilayah'}>
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Info note */}
      <p className="text-xs text-gray-400 mt-4">
        Wilayah yang memiliki sekolah terdaftar tidak dapat dihapus. Pindahkan atau hapus semua sekolah di wilayah tersebut terlebih dahulu.
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
          <TextInput label="Nama Wilayah" required value={form.name}
            onChange={e => set('name', e.target.value)} error={errors.name}
            placeholder="contoh: Jakarta Pusat" />
          <TextInput label="Provinsi" required value={form.province}
            onChange={e => set('province', e.target.value)} error={errors.province}
            placeholder="contoh: DKI Jakarta" />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
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
              <strong className="text-red-600">{linkedCount} sekolah</strong> yang terdaftar.
            </p>
            <p className="text-xs text-gray-500">
              Pindahkan semua sekolah ke wilayah lain atau hapus sekolah tersebut terlebih dahulu melalui halaman Manajemen Sekolah.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Anda akan menghapus wilayah <strong>{target?.name}</strong> secara permanen.
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
