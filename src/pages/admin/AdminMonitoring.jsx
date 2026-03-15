import { useState } from 'react'
import { School, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useDashboard }   from '../../hooks/useDashboard'
import Card               from '../../components/ui/Card'
import StatCard           from '../../components/ui/StatCard'
import CoverageChart      from '../../components/charts/CoverageChart'
import Badge              from '../../components/ui/Badge'
import Spinner            from '../../components/ui/Spinner'
import regionsData        from '../../data/regions.json'
import { formatPeriod, getBadgeConfig } from '../../utils/formatters'

export default function AdminMonitoring() {
  const { stats, loading, period } = useDashboard()
  const [regionFilter, setRegionFilter] = useState('')

  if (loading || !stats) return <Spinner center />

  const { kpis, coverage, school_status } = stats

  // Build flat school status list (from rankings since admin sees all)
  const schoolList = (stats.top_schools ?? [])

  // filter if needed — for admin we use coverage data + show per-school from rankings
  const filteredCoverage = regionFilter
    ? coverage.filter(c => c.region_id === regionFilter)
    : coverage

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Program</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatPeriod(period)}</p>
        </div>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="input text-sm w-52"
        >
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Sekolah Aktif"      value={kpis.active_schools}    sub={`dari ${kpis.total_schools}`}  color="teal"  icon={<School size={18} />} />
        <StatCard label="Sekolah Melapor"    value={kpis.reporting_schools} sub="periode ini"                   color="blue"  icon={<CheckCircle size={18} />} />
        <StatCard label="Laporan Validated"  value={kpis.validated_reports} sub="periode ini"                   color="teal"  icon={<CheckCircle size={18} />} />
        <StatCard label="Laporan Pending"    value={kpis.pending_reports}   sub="menunggu review"               color={kpis.pending_reports > 0 ? 'red' : 'gray'} icon={<Clock size={18} />} />
      </div>

      {/* Coverage chart */}
      <Card title="Cakupan Pelaporan per Wilayah" subtitle={formatPeriod(period)} className="mb-5">
        <CoverageChart data={filteredCoverage} />
      </Card>

      {/* School status table */}
      <Card title="Status Semua Sekolah" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Sekolah</th>
                <th className="th">Wilayah</th>
                <th className="th w-24 text-center">Laporan</th>
                <th className="th w-24 text-center">Guru LMS</th>
                <th className="th w-20 text-center">Skor</th>
                <th className="th w-24 text-center">Badge</th>
              </tr>
            </thead>
            <tbody>
              {(stats.top_schools ?? []).map(school => {
                const badgeCfg = school.badge ? getBadgeConfig(school.badge.tier) : null
                return (
                  <tr key={school.school_id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="td font-medium text-gray-900">{school.school_name}</td>
                    <td className="td text-gray-500 text-xs">{school.district}</td>
                    <td className="td text-center">
                      <span className={`text-sm font-semibold ${school.report_count > 0 ? 'text-teal-700' : 'text-red-500'}`}>
                        {school.report_count}
                      </span>
                    </td>
                    <td className="td text-center">
                      <span className="text-sm text-gray-700">{school.teacher_count}</span>
                    </td>
                    <td className="td text-center">
                      <span className={`text-sm font-bold ${
                        school.total_score >= 70 ? 'text-teal-700' :
                        school.total_score >= 40 ? 'text-amber-600' : 'text-gray-500'
                      }`}>{school.total_score}</span>
                    </td>
                    <td className="td text-center">
                      {badgeCfg
                        ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCfg.className}`}>{badgeCfg.emoji}</span>
                        : <span className="text-gray-300 text-xs">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
