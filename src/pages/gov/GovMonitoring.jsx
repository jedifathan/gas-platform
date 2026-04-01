import { useState, useEffect } from 'react'
import { useAuth }            from '../../hooks/useAuth'
import { useApp }             from '../../hooks/useApp'
import { getSchoolsByRegion } from '../../services/schoolService'
import { getRegionById }      from '../../services/regionService'
import Card       from '../../components/ui/Card'
import StatCard   from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner    from '../../components/ui/Spinner'
import { School, CheckCircle, XCircle, Users } from 'lucide-react'
import { formatPeriod } from '../../utils/formatters'

export default function GovMonitoring() {
  const { session }      = useAuth()
  const { globalPeriod } = useApp()
  const [schools, setSchools] = useState([])
  const [region,  setRegion]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.region_id) return
    setLoading(true)
    Promise.all([
      getSchoolsByRegion(session.region_id),
      getRegionById(session.region_id),
    ]).then(([s, r]) => { setSchools(s); setRegion(r) })
     .finally(() => setLoading(false))
  }, [session?.region_id])

  if (loading) return <Spinner center />

  const regionName    = region?.name ?? '—'
  const activeSchools = schools.filter(s => s.is_active).length
  const totalTeachers = schools.reduce((s, x) => s + (x.total_teachers ?? 0), 0)
  const coveragePct   = schools.length ? Math.round((activeSchools / schools.length) * 100) : 0

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">{regionName} · {formatPeriod(globalPeriod)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Sekolah"  value={schools.length}            sub="terdaftar"                          color="teal" icon={<School size={18} />} />
        <StatCard label="Sekolah Aktif"  value={activeSchools}             sub={`${coveragePct}% dari total`}       color="blue" icon={<CheckCircle size={18} />} />
        <StatCard label="Total Guru"     value={totalTeachers}             sub="di wilayah ini"                     color="teal" icon={<Users size={18} />} />
      </div>

      <Card title="Tingkat Aktivitas Sekolah" className="mb-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{activeSchools} dari {schools.length} sekolah aktif</span>
            <span className={`font-bold ${coveragePct >= 75 ? 'text-primary-600' : coveragePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {coveragePct}%
            </span>
          </div>
          <ProgressBar
            value={coveragePct}
            size="md"
            color={coveragePct >= 75 ? 'teal' : coveragePct >= 50 ? 'amber' : 'red'}
          />
        </div>
      </Card>

      <Card title="Detail Per Sekolah" noPadding>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="th">Sekolah</th>
              <th className="th w-28 text-center">Total Murid</th>
              <th className="th w-24 text-center">Total Guru</th>
              <th className="th w-28 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {schools.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-alabaster">
                <td className="td">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.district}</p>
                </td>
                <td className="td text-center text-sm">{s.total_students ?? '—'}</td>
                <td className="td text-center text-sm">{s.total_teachers ?? '—'}</td>
                <td className="td text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.is_active ? 'text-primary-600' : 'text-red-500'}`}>
                    {s.is_active ? <><CheckCircle size={12} /> Aktif</> : <><XCircle size={12} /> Tidak Aktif</>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
