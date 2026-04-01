import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { School, Users, BarChart2, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { useAuth }            from '../../hooks/useAuth'
import { useApp }             from '../../hooks/useApp'
import { getSchoolsByRegion } from '../../services/schoolService'
import { getRegionById }      from '../../services/regionService'
import StatCard  from '../../components/ui/StatCard'
import Card      from '../../components/ui/Card'
import Button    from '../../components/ui/Button'
import Spinner   from '../../components/ui/Spinner'
import { formatPeriod } from '../../utils/formatters'

export default function GovDashboard() {
  const { session }      = useAuth()
  const { globalPeriod } = useApp()
  const navigate         = useNavigate()
  const [schools, setSchools] = useState([])
  const [region,  setRegion]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.region_id) return
    setLoading(true)
    Promise.all([
      getSchoolsByRegion(session.region_id),
      getRegionById(session.region_id),
    ]).then(([schoolList, regionData]) => {
      setSchools(schoolList)
      setRegion(regionData)
    }).finally(() => setLoading(false))
  }, [session?.region_id])

  if (loading) return <Spinner center />

  const regionName    = region?.name ?? session?.region?.name ?? '—'
  const activeSchools = schools.filter(s => s.is_active).length
  const totalStudents = schools.reduce((s, x) => s + (x.total_students ?? 0), 0)
  const totalTeachers = schools.reduce((s, x) => s + (x.total_teachers ?? 0), 0)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">{regionName} · {formatPeriod(globalPeriod)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sekolah Terdaftar" value={schools.length} sub="di wilayah ini"    color="teal"  icon={<School size={18} />} />
        <StatCard label="Sekolah Aktif"     value={activeSchools}  sub="dari total"        color="blue"  icon={<CheckCircle size={18} />} />
        <StatCard label="Tidak Aktif"       value={schools.length - activeSchools}
          sub="sekolah" color={schools.length - activeSchools > 0 ? 'red' : 'gray'} icon={<XCircle size={18} />} />
        <StatCard label="Total Murid"   value={totalStudents} sub="di wilayah ini" color="amber" icon={<BarChart2 size={18} />} />
        <StatCard label="Total Guru"    value={totalTeachers} sub="di wilayah ini" color="teal"  icon={<Users size={18} />} />
      </div>

      <Card
        title="Daftar Sekolah"
        subtitle={`${schools.length} sekolah di ${regionName}`}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/gov/monitoring')}
            iconRight={<ArrowRight size={13} />}>Lihat detail</Button>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-hide">
          {schools.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ada sekolah di wilayah ini.</p>
          ) : schools.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-alabaster">
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.is_active ? 'bg-primary-500' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{s.name}</p>
                <p className="text-[10px] text-gray-400">{s.district}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-500">{s.total_students ?? '—'} murid</p>
                <p className="text-[10px] text-gray-400">{s.total_teachers ?? '—'} guru</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
