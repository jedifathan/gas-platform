import { useDashboard }  from '../../hooks/useDashboard'
import StatCard          from '../../components/ui/StatCard'
import Card              from '../../components/ui/Card'
import ProgressBar       from '../../components/ui/ProgressBar'
import StatusPill        from '../../components/ui/StatusPill'
import Spinner           from '../../components/ui/Spinner'
import { School, CheckCircle, XCircle, Users, BarChart2 } from 'lucide-react'
import { formatPeriod, getBadgeConfig } from '../../utils/formatters'

export default function GovMonitoring() {
  const { stats, loading, period } = useDashboard()

  if (loading || !stats) return <Spinner center />

  const { kpis, school_status } = stats
  const coveragePct = kpis.total_schools
    ? Math.round((kpis.reporting_schools / kpis.total_schools) * 100)
    : 0

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.region_name} · {formatPeriod(period)}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sekolah Aktif"      value={kpis.total_schools}      sub="terdaftar"          color="teal"  icon={<School size={18} />} />
        <StatCard label="Melapor Bulan Ini"  value={kpis.reporting_schools}  sub={`${coveragePct}% cakupan`} color="blue"  icon={<CheckCircle size={18} />} />
        <StatCard label="Guru Terlatih"      value={kpis.certified_teachers} sub={`dari ${kpis.total_teachers}`} color="teal" icon={<Users size={18} />} />
      </div>

      {/* Coverage bar */}
      <Card title="Tingkat Cakupan Pelaporan" className="mb-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{kpis.reporting_schools} dari {kpis.total_schools} sekolah melapor</span>
            <span className={`font-bold ${coveragePct >= 75 ? 'text-teal-600' : coveragePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
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

      {/* School detail table */}
      <Card title="Detail Per Sekolah" noPadding>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="th">Sekolah</th>
              <th className="th w-28 text-center">Laporan Bulan Ini</th>
              <th className="th w-20 text-center">Skor</th>
              <th className="th w-24 text-center">Badge</th>
              <th className="th w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {school_status.map(({ school, rank, reports, reporting }) => {
              const badgeCfg = rank?.badge ? getBadgeConfig(rank.badge.tier) : null
              const submittedCount = reports.filter(r => ['submitted','validated'].includes(r.status)).length
              return (
                <tr key={school.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="td">
                    <p className="text-sm font-medium text-gray-900">{school.name}</p>
                    <p className="text-xs text-gray-400">{school.district}</p>
                  </td>
                  <td className="td text-center">
                    <span className={`text-sm font-semibold ${submittedCount > 0 ? 'text-teal-700' : 'text-red-500'}`}>
                      {submittedCount}
                    </span>
                  </td>
                  <td className="td text-center">
                    <span className={`text-sm font-bold ${
                      (rank?.total_score ?? 0) >= 70 ? 'text-teal-700' :
                      (rank?.total_score ?? 0) >= 40 ? 'text-amber-600' : 'text-gray-400'
                    }`}>{rank?.total_score ?? '—'}</span>
                  </td>
                  <td className="td text-center">
                    {badgeCfg
                      ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeCfg.className}`}>{badgeCfg.emoji} {badgeCfg.label}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="td text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${reporting ? 'text-teal-600' : 'text-red-500'}`}>
                      {reporting
                        ? <><CheckCircle size={12} /> Aktif</>
                        : <><XCircle size={12} /> Tidak Aktif</>}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
