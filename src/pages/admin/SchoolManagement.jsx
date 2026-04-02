import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, School, MapPin, Plus } from 'lucide-react'
import { getAllSchools, createSchool, updateSchool } from '../../services/schoolService'
import { getAllRegions } from '../../services/regionService'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Badge         from '../../components/ui/Badge'
import Button        from '../../components/ui/Button'
import Modal         from '../../components/ui/Modal'
import EmptyState    from '../../components/ui/EmptyState'
import Spinner       from '../../components/ui/Spinner'
import TextInput     from '../../components/forms/TextInput'
import SelectInput   from '../../components/forms/SelectInput'

const STATUS_CONFIG = {
  active:   { label: 'Aktif',    color: 'green'  },
  pending:  { label: 'Pending',  color: 'yellow' },
  inactive: { label: 'Nonaktif', color: 'gray'   },
}

const EMPTY_FORM = {
  name: '', region_id: '', district: '', address: '',
  total_students: '', total_teachers: '',
}

export default function SchoolManagement() {
  const navigate      = useNavigate()
  const { toast }     = useApp()

  const [schools,  setSchools]  = useState([])
  const [regions,  setRegions]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [regionF,  setRegionF]  = useState('')

  const [modal,   setModal]   = useState(null)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [s, r] = await Promise.all([getAllSchools(), getAllRegions()])
    setSchools(s)
    setRegions(r)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = schools.filter(s => {
    const q = search.toLowerCase()
    return (
      (!search || s.name.toLowerCase().includes(q) || (s.district ?? '').toLowerCase().includes(q)) &&
      (!regionF || s.region_id === regionF)
    )
  })

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal('create')
  }

  function openEdit(e, school) {
    e.stopPropagation()
    setEditing(school)
    setForm({
      name:           school.name,
      region_id:      school.region_id  ?? '',
      district:       school.district   ?? '',
      address:        school.address    ?? '',
      total_students: school.total_students ?? '',
      total_teachers: school.total_teachers ?? '',
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
    const result = modal === 'create'
      ? await createSchool(form)
      : await updateSchool(editing.id, form)
    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal menyimpan.')
      return
    }

    await fetchAll()
    toast.success(modal === 'create' ? 'Sekolah berhasil ditambahkan.' : 'Sekolah berhasil diperbarui.')
    setModal(null)
  }

  const regionOpts = regions.map(r => ({ value: r.id, label: `${r.name} — ${r.kota}` }))

  if (loading) return <Spinner center />

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
        <select value={regionF} onChange={e => setRegionF(e.target.value)} className="input text-sm w-56">
          <option value="">Semua Wilayah</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name} — {r.kota}</option>)}
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
                <th className="th">Kecamatan / Wilayah</th>
                <th className="th w-24 text-center">Murid</th>
                <th className="th w-24 text-center">Guru</th>
                <th className="th w-24 text-center">Status</th>
                <th className="th w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(school => {
                const reg = regions.find(r => r.id === school.region_id)
                return (
                  <tr key={school.id}
                    className="border-b border-gray-100 hover:bg-alabaster cursor-pointer group"
                    onClick={() => navigate(`/app/admin/schools/${school.id}`)}
                  >
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <School size={14} className="text-primary-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700">
                          {school.name}
                        </p>
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {school.district}{reg ? `, ${reg.name}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="td text-center text-sm text-gray-700">
                      {school.total_students ?? '—'}
                    </td>
                    <td className="td text-center text-sm text-gray-700">
                      {school.total_teachers ?? '—'}
                    </td>
                    <td className="td text-center">
                      <Badge color={school.is_active ? 'green' : 'gray'} size="sm">
                        {school.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="td text-center" onClick={e => e.stopPropagation()}>
                      <button onClick={e => openEdit(e, school)}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium
                                   px-2 py-1 rounded hover:bg-primary-50 transition-colors">
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
            <SelectInput label="Wilayah (Kecamatan)" required options={regionOpts}
              value={form.region_id} onChange={e => set('region_id', e.target.value)}
              error={errors.region_id} placeholder="Pilih wilayah..." />
            <TextInput label="Kecamatan" value={form.district}
              onChange={e => set('district', e.target.value)}
              placeholder="contoh: Pasar Rebo" />
          </div>
          <TextInput label="Alamat" value={form.address}
            onChange={e => set('address', e.target.value)} placeholder="Jl. ..." />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Total Murid" type="number" min="0"
              value={form.total_students} onChange={e => set('total_students', e.target.value)}
              placeholder="contoh: 60" />
            <TextInput label="Total Guru" type="number" min="0"
              value={form.total_teachers} onChange={e => set('total_teachers', e.target.value)}
              placeholder="contoh: 4" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
