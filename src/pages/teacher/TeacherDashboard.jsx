import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Trophy, Plus, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { useDashboard }  from '../../hooks/useDashboard'
import { useApp }        from '../../hooks/useApp'
import StatCard          from '../../components/ui/StatCard'
import Card              from '../../components/ui/Card'
import ProgressBar       from '../../components/ui/ProgressBar'
import StatusPill        from '../../components/ui/StatusPill'
import Button            from '../../components/ui/Button'
import Spinner           from '../../components/ui/Spinner'
import { formatPeriod, formatRelativeTime, getRankEmoji, getBadgeConfig } from '../../utils/formatters'

export default function TeacherDashboard() {
  const { stats, loading, period }  = useDashboard()
  const { toast }   = useApp()
  const navigate    = useNavigate()

  if (loading || !stats) return <Spinner center />

  const { kpis, course_progress, recent_reports } = stats

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Selamat datang, {stats.teacher_name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatPeriod(period)}</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => navigate('/app/teacher/reports/new')}
        >
          Buat Laporan
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Kursus Selesai"
          value={`${kpis.courses_certified}/${kpis.total_courses}`}
          sub={kpis.courses_in_progress > 0 ? `${kpis.courses_in_progress} sedang berjalan` : 'Semua selesai'}
          icon={<BookOpen size={18} />}
          color="teal"
        />
        <StatCard
          label="Laporan Bulan Ini"
          value={kpis.reports_this_period}
          sub={`${kpis.validated_this_period} tervalidasi`}
          icon={<FileText size={18} />}
          color="blue"
        />
        <StatCard
          label="Peringkat Sekolah"
          value={kpis.school_rank ? getRankEmoji(kpis.school_rank) : '—'}
          sub="Peringkat regional"
          icon={<Trophy size={18} />}
          color="amber"
          onClick={() => navigate('/app/teacher/dashboard')}
        />
        <StatCard
          label="Skor Sekolah"
          value={kpis.school_score ?? '—'}
          sub={kpis.school_badge
            ? `${getBadgeConfig(kpis.school_badge.tier).emoji} ${kpis.school_badge.name}`
            : 'dari 100'}
          icon={<Trophy size={18} />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Course progress */}
        <Card
          title="Kursus Saya"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/teacher/lms')}
              iconRight={<ArrowRight size={13} />}>
              Lihat semua
            </Button>
          }
        >
          <div className="space-y-4">
            {course_progress.map(({ course, progress: prog, status, pct }) => {
              const statusColor =
                status === 'certified'   ? 'text-teal-700 bg-teal-50'  :
                status === 'in_progress' ? 'text-amber-700 bg-amber-50' :
                'text-gray-500 bg-gray-50'
              const statusLabel =
                status === 'certified'   ? 'Selesai ✓'  :
                status === 'in_progress' ? 'Berlangsung' : 'Belum mulai'

              return (
                <div key={course.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/app/teacher/lms/${course.id}`)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-teal-700
                                  transition-colors truncate max-w-[65%]">
                      {course.title}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <ProgressBar value={pct} size="xs"
                    color={status === 'certified' ? 'teal' : status === 'in_progress' ? 'amber' : 'gray'} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {status === 'certified'
                      ? `Skor kuis: ${prog?.quiz_score}%`
                      : `${prog?.lessons_completed?.length ?? 0}/${course.total_lessons} pelajaran`}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent reports */}
        <Card
          title="Laporan Terakhir"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/teacher/reports')}
              iconRight={<ArrowRight size={13} />}>
              Lihat semua
            </Button>
          }
        >
          {recent_reports.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">
              <FileText size={28} className="mx-auto mb-2 opacity-40" />
              <p>Belum ada laporan.</p>
              <Button size="sm" variant="teal_outline" className="mt-3"
                onClick={() => navigate('/app/teacher/reports/new')}>
                Buat laporan pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent_reports.slice(0, 5).map(report => (
                <div
                  key={report.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50
                             cursor-pointer transition-colors group"
                  onClick={() => navigate(`/app/teacher/reports/${report.id}`)}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-teal-700">
                      {report.activity_label}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatPeriod(report.report_period)} · {formatRelativeTime(report.updated_at)}
                    </p>
                  </div>
                  <StatusPill status={report.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
