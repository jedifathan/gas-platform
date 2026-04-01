import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { School, FileText, Users, BarChart2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { useDashboard }       from '../../hooks/useDashboard'
import { useApp }             from '../../hooks/useApp'
import { recomputeScores }    from '../../services/leaderboardService'
import { getMultiPeriodStats } from '../../services/dashboardService'
import StatCard          from '../../components/ui/StatCard'
import Card              from '../../components/ui/Card'
import Button            from '../../components/ui/Button'
import StatusPill        from '../../components/ui/StatusPill'
import CoverageChart     from '../../components/charts/CoverageChart'
import BarChart          from '../../components/charts/BarChart'
import LeaderboardTable  from '../../components/leaderboard/LeaderboardTable'
import Spinner           from '../../components/ui/Spinner'
import { formatPeriod, formatRelativeTime } from '../../utils/formatters'

export default function AdminDashboard() {
  const { stats, loading, period, refresh } = useDashboard()
  const { toast }   = useApp()
  const navigate    = useNavigate()

  // Multi-period trend data for the last 4 months
  const trendData = useMemo(() => getMultiPeriodStats(period, 4), [period])

  if (loading || !stats) return <Spinner center />

  const { kpis, coverage, top_schools, recent_reports } = stats

  function handleRecompute() {
    const result = recomputeScores(period)
    refresh()
    toast.success(`${result.recomputed} skor sekolah dihitung ulang.`)
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Administrator</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatPeriod(period)}</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={handleRecompute}>
          Hitung Ulang Skor
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Sekolah Aktif"
          value={kpis.active_schools}
          sub={`dari ${kpis.total_schools} terdaftar`}
          icon={<School size={18} />}
          color="teal"
          onClick={() => navigate('/app/admin/schools')}
        />
        <StatCard
          label="Laporan Menunggu"
          value={kpis.pending_reports}
          sub="perlu validasi"
          trend={kpis.pending_reports > 0 ? `${kpis.pending_reports} pending` : undefined}
          trendUp={false}
          icon={<AlertCircle size={18} />}
          color={kpis.pending_reports > 0 ? 'red' : 'gray'}
          onClick={() => navigate('/app/admin/reports')}
        />
        <StatCard
          label="Guru Terlatih"
          value={kpis.trained_teachers}
          sub={`dari ${kpis.total_teachers} guru`}
          icon={<Users size={18} />}
          color="blue"
          onClick={() => navigate('/app/admin/users')}
        />
        <StatCard
          label="Rata-rata Skor"
          value={kpis.avg_score}
          sub="dari 100 poin"
          icon={<BarChart2 size={18} />}
          color="amber"
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Laporan Tervalidasi" value={kpis.validated_reports} sub="periode ini" color="teal"  icon={<FileText size={18} />} />
        <StatCard label="Sekolah Melapor"     value={kpis.reporting_schools} sub="periode ini" color="blue"  icon={<School size={18} />} />
        <StatCard label="Total Sekolah"       value={kpis.total_schools}     sub="terdaftar"   color="gray"  icon={<School size={18} />} />
        <StatCard label="Total Guru"          value={kpis.total_teachers}    sub="aktif"       color="gray"  icon={<Users size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Coverage chart */}
        <Card title="Cakupan per Wilayah" subtitle={formatPeriod(period)}>
          <div className="max-h-72 overflow-y-auto pr-1 scrollbar-hide">
          <CoverageChart data={coverage} />
        </div>
        </Card>

        {/* Pending reports quick action */}
        <Card
          title="Laporan Menunggu Validasi"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/reports')}
              iconRight={<ArrowRight size={13} />}>
              Lihat semua
            </Button>
          }
        >
          {recent_reports.filter(r => r.status === 'submitted').length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Tidak ada laporan pending.</p>
          ) : (
            <div className="space-y-2">
              {recent_reports.filter(r => r.status === 'submitted').slice(0, 5).map(r => (
                <div key={r.id}
                  onClick={() => navigate(`/app/admin/reports/${r.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-alabaster cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-primary-700">
                      {r.school_name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {r.activity_label} · {formatRelativeTime(r.submitted_at)}
                    </p>
                  </div>
                  <StatusPill status={r.status} size="sm" />
                  <Button size="sm" variant="teal_outline"
                    onClick={e => { e.stopPropagation(); navigate(`/app/admin/reports/${r.id}`) }}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card title="Laporan Tervalidasi" subtitle="4 bulan terakhir">
          <BarChart
            data={trendData}
            bars={[{ key: 'validated', color: '#0F6E56', label: 'Tervalidasi' }]}
            height={180}
            formatter={v => `${v} laporan`}
          />
        </Card>
        <Card title="Rata-rata Skor Sekolah" subtitle="4 bulan terakhir">
          <BarChart
            data={trendData}
            bars={[{ key: 'avg_score', color: '#BA7517', label: 'Rata-rata Skor' }]}
            height={180}
            formatter={v => `${v} pts`}
          />
        </Card>
      </div>

      {/* Top schools */}
      <Card
        title="Top 5 Sekolah"
        subtitle={formatPeriod(period)}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/leaderboard')}
            iconRight={<ArrowRight size={13} />}>
            Lihat semua
          </Button>
        }
        noPadding
      >
        <LeaderboardTable rankings={top_schools} showBreakdown />
      </Card>
    </div>
  )
}
