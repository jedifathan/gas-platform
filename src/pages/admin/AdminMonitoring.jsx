import { useState, useMemo } from 'react'
import { School, CheckCircle, Clock } from 'lucide-react'
import { useDashboard }        from '../../hooks/useDashboard'
import Card                    from '../../components/ui/Card'
import StatCard                from '../../components/ui/StatCard'
import CoverageChart           from '../../components/charts/CoverageChart'
import Spinner                 from '../../components/ui/Spinner'
import schoolsData             from '../../data/schools.json'
import usersData               from '../../data/users.json'
import regionsData             from '../../data/regions.json'
import { computeLeaderboard }  from '../../services/leaderboardService'
import { getLMSCompletionRate } from '../../services/lmsService'
import { formatPeriod, getBadgeConfig } from '../../utils/formatters'

/**
 * BUG FIX: The previous version destructured `school_status` from stats but
 * getAdminStats() never returns that field — it only exists on getGovStats().
 * This version computes the full school list independently using all schools,
 * not just the top_schools slice from the dashboard.
 */
export default function AdminMonitoring() {
  const { stats, loading, period } = useDashboard()
  const [regionFilter, setRegionFilter] = useState('')

  // Compute full school list with live ranking data for the current period + filter
  const schoolList = useMemo(() => {
    if (!period) return []
    const rankings = computeLeaderboard(period, regionFilter || null)
    const base = regionFilter
      ? schoolsData.filter(s => s.status === 'active' && s.region_id === regionFilter)
      : schoolsData.filter(s => s.status === 'active')

    return base.map(school => {
      const rank     = rankings.find(r => r.school_id === school.id) ?? null
      const teachers = usersData.filter(u => u.role === 'teacher' && u.school_id === school.id)
      const lms      = getLMSCompletionRate(school.id, teachers)
      return { school, rank, teachers, lms }
    })
  }, [period, regionFilter])

  const filteredCoverage = useMemo(() => {
    if (!stats?.coverage) return []
    return regionFilter
      ? stats.coverage.filter(c => c.region_id === regionFilter)
      : stats.coverage
  }, [stats?.coverage, regionFilter])

  if (loading || !stats) return <Spinner center />

  const { kpis } = stats

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
        <StatCard label="Sekolah Aktif"     value={kpis.active_schools}    sub={`dari ${kpis.total_schools}`}  color="teal"  icon={<School size={18} />} />
        <StatCard label="Sekolah Melapor"   value={kpis.reporting_schools} sub="periode ini"                   color="blue"  icon={<CheckCircle size={18} />} />
        <StatCard label="Laporan Validated" value={kpis.validated_reports} sub="periode ini"                   color="teal"  icon={<CheckCircle size={18} />} />
        <StatCard label="Laporan Pending"   value={kpis.pending_reports}   sub="menunggu review"               color={kpis.pending_reports > 0 ? 'red' : 'gray'} icon={<Clock size={18} />} />
      </div>

      {/* Coverage chart */}
      <Card title="Cakupan Pelaporan per Wilayah" subtitle={formatPeriod(period)} className="mb-5">
        <CoverageChart data={filteredCoverage} />
      </Card>

      {/* Full school status table — all active schools, not just top 5 */}
      <Card title={`Status Semua Sekolah${regionFilter ? ` — ${regionsData.find(r => r.id === regionFilter)?.name}` : ''}`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Sekolah</th>
                <th className="th">Wilayah</th>
                <th className="th w-24 text-center">Laporan</th>
                <th className="th w-28 text-center">LMS Guru</th>
                <th className="th w-20 text-center">Skor</th>
                <th className="th w-24 text-center">Badge</th>
              </tr>
            </thead>
            <tbody>
              {schoolList.map(({ school, rank, lms }) => {
                const badgeCfg = rank?.badge ? getBadgeConfig(rank.badge.tier) : null
                return (
                  <tr key={school.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="td">
                      <p className="font-medium text-gray-900 text-sm">{school.name}</p>
                      <p className="text-xs text-gray-400">{school.district}</p>
                    </td>
                    <td className="td text-xs text-gray-500">
                      {regionsData.find(r => r.id === school.region_id)?.name ?? '—'}
                    </td>
                    <td className="td text-center">
                      <span className={`text-sm font-semibold ${
                        (rank?.report_count ?? 0) > 0 ? 'text-teal-700' : 'text-red-500'
                      }`}>
                        {rank?.report_count ?? 0}
                      </span>
                    </td>
                    <td className="td text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-medium text-gray-700">
                          {lms.certified}/{rank?.teacher_count ?? lms.total_slots}
                        </span>
                        <span className="text-[10px] text-gray-400">bersertifikat</span>
                      </div>
                    </td>
                    <td className="td text-center">
                      <span className={`text-sm font-bold ${
                        (rank?.total_score ?? 0) >= 70 ? 'text-teal-700' :
                        (rank?.total_score ?? 0) >= 40 ? 'text-amber-600' : 'text-gray-400'
                      }`}>{rank?.total_score ?? '—'}</span>
                    </td>
                    <td className="td text-center">
                      {badgeCfg
                        ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCfg.className}`}>{badgeCfg.emoji}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
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
