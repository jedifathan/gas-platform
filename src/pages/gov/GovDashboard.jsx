import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { School, FileText, Users, BarChart2, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { useDashboard }        from '../../hooks/useDashboard'
import { getMultiPeriodStats } from '../../services/dashboardService'
import StatCard          from '../../components/ui/StatCard'
import Card              from '../../components/ui/Card'
import Button            from '../../components/ui/Button'
import BarChart          from '../../components/charts/BarChart'
import LeaderboardTable  from '../../components/leaderboard/LeaderboardTable'
import Spinner           from '../../components/ui/Spinner'
import { formatPeriod, getBadgeConfig } from '../../utils/formatters'

export default function GovDashboard() {
  const { stats, loading, period } = useDashboard()
  const navigate = useNavigate()

  const trendData = useMemo(
    () => stats ? getMultiPeriodStats(period, 4, stats.region_id) : [],
    [period, stats]
  )

  if (loading || !stats) return <Spinner center />

  const { kpis, school_status, rankings } = stats
  const activeCount   = school_status.filter(s => s.reporting).length
  const inactiveCount = school_status.filter(s => !s.reporting).length

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.region_name} · {formatPeriod(period)}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sekolah Terdaftar"  value={kpis.total_schools}      sub="di wilayah ini"              color="teal"  icon={<School size={18} />} />
        <StatCard label="Sekolah Melapor"    value={kpis.reporting_schools}  sub={`dari ${kpis.total_schools}`} color="blue"  icon={<CheckCircle size={18} />} />
        <StatCard label="Laporan Validated"  value={kpis.validated_reports}  sub="periode ini"                  color="teal"  icon={<FileText size={18} />} />
        <StatCard label="Rata-rata Skor"     value={kpis.avg_score}          sub="dari 100 poin"                color="amber" icon={<BarChart2 size={18} />} />
        <StatCard label="Guru Bersertifikat" value={kpis.certified_teachers} sub={`dari ${kpis.total_teachers}`} color="blue"  icon={<Users size={18} />} />
        <StatCard label="Tidak Melapor"      value={inactiveCount}           sub="sekolah bulan ini"
          color={inactiveCount > 0 ? 'red' : 'gray'} icon={<XCircle size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* School status list */}
        <Card
          title="Status Sekolah"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/gov/monitoring')}
              iconRight={<ArrowRight size={13} />}>Lihat detail</Button>
          }
        >
          <div className="space-y-2">
            {school_status.slice(0, 6).map(({ school, rank, reporting }) => {
              const badgeCfg = rank?.badge ? getBadgeConfig(rank.badge.tier) : null
              return (
                <div key={school.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${reporting ? 'bg-teal-500' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{school.name}</p>
                    <p className="text-[10px] text-gray-400">{school.district}</p>
                  </div>
                  {rank && (
                    <span className="text-xs font-bold text-teal-700 shrink-0">{rank.total_score} pts</span>
                  )}
                  {badgeCfg && <span className="text-sm shrink-0">{badgeCfg.emoji}</span>}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Rankings preview */}
        <Card
          title="Peringkat Wilayah"
          subtitle={formatPeriod(period)}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/gov/leaderboard')}
              iconRight={<ArrowRight size={13} />}>Lihat semua</Button>
          }
          noPadding
        >
          <LeaderboardTable rankings={rankings.slice(0, 5)} showBreakdown={false} />
        </Card>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Laporan Tervalidasi" subtitle="4 bulan terakhir">
          <BarChart
            data={trendData}
            bars={[{ key: 'validated', color: '#0F6E56', label: 'Tervalidasi' }]}
            height={180}
            formatter={v => `${v} laporan`}
          />
        </Card>
        <Card title="Sekolah Aktif Melapor" subtitle="4 bulan terakhir">
          <BarChart
            data={trendData}
            bars={[{ key: 'reporting', color: '#185FA5', label: 'Sekolah Melapor' }]}
            height={180}
            formatter={v => `${v} sekolah`}
          />
        </Card>
      </div>
    </div>
  )
}
