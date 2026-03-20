import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, School, MapPin, ChevronRight, Plus, X } from 'lucide-react'
import { getAllSchools, createSchool, updateSchool } from '../../services/schoolService'
import regionsData from '../../data/regions.json'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Badge         from '../../components/ui/Badge'
import Button        from '../../components/ui/Button'
import Modal         from '../../components/ui/Modal'
import EmptyState    from '../../components/ui/EmptyState'
import TextInput     from '../../components/forms/TextInput'
import SelectInput   from '../../components/forms/SelectInput'
import { formatDate } from '../../utils/formatters'

const STATUS_CONFIG = {
  active:   { label: 'Aktif',    color: 'green'  },
  pending:  { label: 'Pending',  color: 'yellow' },
  inactive: { label: 'Nonaktif', color: 'gray'   },
}

const EMPTY_FORM = {
  name: '', region_id: '', district: '', address: '',
  principal_name: '', phone: '', program_start_date: '', status: 'pending',
}

export default function SchoolManagement() {
  const navigate          = useNavigate()
  const { toast }         = useApp()
  const [schools, setSchools] = useState(() => getAllSchools())
  const [search, setSearch]   = useState('')
  const [region, setRegion]   = useState('')
  const [status, setStatus]   = useState('')

  const [modal,    setModal]    = useState(null)  // 'create' | 'edit' | null
  const [editing,  setEditing]  = useState(null)  // school object being edited
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)

  const filtered = schools.filter(s => {
    const q = search.toLowerCase()
    return (
      (!search || s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q)) &&
      (!region || s.region_id === region) &&
      (!status || s.status === status)
    )
  })

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModal('create')
  }

  function openEdit(e, school) {
    e.stopPropagation()
    setEditing(school)
    setForm({
      name: school.name, region_id: school.region_id, district: school.district,
      address: school.address ?? '', principal_name: school.principal_name ?? '',
      phone: school.phone ?? '', program_start_date: school.program_start_date ?? '',
      status: school.status,
    })
    setErrors({})
    setModal('edit')
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const result = modal === 'create'
      ? createSchool(form)
      : updateSchool(editing.id, form)

    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal menyimpan.')
      return
    }

    setSchools(getAllSchools())
    toast.success(modal === 'create' ? 'Sekolah berhasil ditambahkan.' : 'Sekolah berhasil diperbarui.')
    setModal(null)
  }

  const regionOpts = regionsData.map(r => ({ value: r.id, label: r.name }))
  const statusOpts = [
    { value: 'active',   label: 'Aktif' },
    { value: 'pending',  label: 'Pending' },
    { value: 'inactive', label: 'Nonaktif' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Sekolah</h1>
          <p className="text-sm text-gray-500 mt-0.5">{schools.length} sekolah terdaftar</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
          Tambah Sekolah
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kecamatan..." className="input pl-9 text-sm w-56" />
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} className="input text-sm w-48">
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm w-36">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="pending">Pending</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <Card noPadding>
        {filtered.length === 0 ? (
          <EmptyState icon={<School size={28} />} title="Tidak ada sekolah ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Nama Sekolah</th>
                <th className="th">Wilayah</th>
                <th className="th w-28">Bergabung</th>
                <th className="th w-24 text-center">Status</th>
                <th className="th w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(school => {
                const reg       = regionsData.find(r => r.id === school.region_id)
                const statusCfg = STATUS_CONFIG[school.status] ?? STATUS_CONFIG.inactive
                return (
                  <tr key={school.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => navigate(`/app/admin/schools/${school.id}`)}
                  >
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <School size={14} className="text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">
                            {school.name}
                          </p>
                          <p className="text-xs text-gray-400">{school.principal_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{school.district}, {reg?.name}</span>
                      </div>
                    </td>
                    <td className="td text-xs text-gray-500">{formatDate(school.program_start_date)}</td>
                    <td className="td text-center">
                      <Badge color={statusCfg.color} size="sm">{statusCfg.label}</Badge>
                    </td>
                    <td className="td text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => openEdit(e, school)}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1
                                   rounded hover:bg-teal-50 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Tambah Sekolah Baru' : 'Edit Sekolah'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {modal === 'create' ? 'Tambah Sekolah' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput label="Nama Sekolah" required value={form.name}
            onChange={e => set('name', e.target.value)} error={errors.name}
            placeholder="contoh: TK Harapan Bangsa" />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput label="Wilayah" required options={regionOpts} value={form.region_id}
              onChange={e => set('region_id', e.target.value)} error={errors.region_id}
              placeholder="Pilih wilayah..." />
            <TextInput label="Kecamatan" required value={form.district}
              onChange={e => set('district', e.target.value)} error={errors.district}
              placeholder="contoh: Ciputat" />
          </div>
          <TextInput label="Alamat" value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Jl. ..." />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Kepala Sekolah" value={form.principal_name}
              onChange={e => set('principal_name', e.target.value)}
              placeholder="Nama kepala sekolah" />
            <TextInput label="Telepon" value={form.phone}
              onChange={e => set('phone', e.target.value)} placeholder="021-..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Tanggal Mulai Program" type="date" value={form.program_start_date}
              onChange={e => set('program_start_date', e.target.value)} />
            <SelectInput label="Status" options={statusOpts} value={form.status}
              onChange={e => set('status', e.target.value)} placeholder={null} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
