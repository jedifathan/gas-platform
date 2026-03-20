import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, BarChart2, Trophy, Users, School } from 'lucide-react'
import { computeLeaderboard } from '../../services/leaderboardService'
import { getReports }         from '../../services/reportService'
import schoolsData  from '../../data/schools.json'
import usersData    from '../../data/users.json'
import scoresData   from '../../data/school_scores.json'
import { getBadgeConfig, formatPeriod } from '../../utils/formatters'

const FEATURES = [
  { icon: BookOpen,  title: 'Pelatihan Guru',      desc: 'LMS dengan kursus, kuis, dan sertifikat digital untuk guru PAUD/TK.' },
  { icon: FileText,  title: 'Pelaporan Kegiatan',  desc: 'Sistem pelaporan aktivitas program dengan validasi oleh administrator.' },
  { icon: BarChart2, title: 'Monitoring Program',  desc: 'Dashboard monitoring cakupan dan progres per wilayah secara real-time.' },
  { icon: Trophy,    title: 'Sistem Peringkat',    desc: 'Leaderboard sekolah dengan badge prestasi untuk mendorong partisipasi.' },
]

/** Derive YYYY-MM from today's date — never stale. */
function getCurrentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function PublicHome() {
  const navigate      = useNavigate()
  const currentPeriod = useMemo(() => getCurrentPeriod(), [])

  // Top-3 leaderboard for the current period
  const top3 = useMemo(() => computeLeaderboard(currentPeriod).slice(0, 3), [currentPeriod])

  // Live stats — computed from in-memory service stores, not hardcoded strings
  const stats = useMemo(() => {
    const activeSchools    = schoolsData.filter(s => s.status === 'active').length
    const activeTeachers   = usersData.filter(u => u.role === 'teacher' && u.is_active).length
    const validatedReports = getReports({ status: 'validated' }).length
    const badgesAwarded    = new Set(
      scoresData.filter(s => s.badge_id).map(s => `${s.school_id}-${s.badge_id}`)
    ).size

    return [
      { icon: School,   value: activeSchools,    label: 'Sekolah Terdaftar' },
      { icon: Users,    value: activeTeachers,   label: 'Guru Aktif' },
      { icon: FileText, value: validatedReports, label: 'Laporan Tervalidasi' },
      { icon: Trophy,   value: badgesAwarded,    label: 'Badge Diberikan' },
    ]
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy-900 via-teal-900 to-teal-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30
                           text-teal-200 text-xs font-medium mb-6">
            Program Nasional Kesehatan Gigi Anak
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5 text-balance">
            Gigi Anak Sehat,<br />
            <span className="text-teal-300">Masa Depan Cerah</span>
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Platform digital Program <strong>GAS (Gigi Anak Sehat)</strong> mendukung pelatihan guru,
            pelaporan kegiatan, dan monitoring program kesehatan gigi untuk anak prasekolah
            di seluruh Indonesia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500
                         hover:bg-teal-400 text-white font-semibold text-sm transition-colors">
              Masuk ke Platform <ArrowRight size={16} />
            </button>
            <Link to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-400/40
                         text-teal-200 hover:bg-teal-400/10 font-medium text-sm transition-colors">
              Tentang Program
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live stats bar ── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Platform</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Dirancang untuk mendukung seluruh ekosistem Program GAS — dari pelatihan guru
            hingga transparansi publik.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 flex gap-4 hover:border-teal-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mini leaderboard — current month ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-14 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Peringkat Sekolah</h2>
              <p className="text-xs text-gray-500 mt-0.5">{formatPeriod(currentPeriod)}</p>
            </div>
            <Link to="/leaderboard"
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>

          {top3.length === 0 ? (
            <div className="card p-10 text-center text-sm text-gray-400">
              Belum ada data peringkat untuk periode ini.
            </div>
          ) : (
            <div className="space-y-3">
              {top3.map((school, i) => {
                const medal    = ['🥇', '🥈', '🥉'][i]
                const badgeCfg = school.badge ? getBadgeConfig(school.badge.tier) : null
                return (
                  <div key={school.school_id}
                    className="card p-4 flex items-center gap-4 hover:border-teal-200 transition-colors">
                    <span className="text-2xl w-8 text-center shrink-0">{medal}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{school.school_name}</p>
                      <p className="text-xs text-gray-500 truncate">{school.district}</p>
                    </div>
                    {badgeCfg && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeCfg.className}`}>
                        {badgeCfg.emoji} {badgeCfg.label}
                      </span>
                    )}
                    <span className="text-lg font-black text-teal-700 shrink-0">{school.total_score}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Bergabung dengan Program GAS</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-7">
          Daftarkan sekolah Anda dan mulai perjalanan menuju generasi anak Indonesia
          dengan kesehatan gigi yang lebih baik.
        </p>
        <button onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-teal-600
                     hover:bg-teal-700 text-white font-semibold text-sm transition-colors">
          Mulai Sekarang <ArrowRight size={16} />
        </button>
      </section>
    </div>
  )
}
