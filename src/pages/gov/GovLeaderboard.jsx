import { Trophy } from 'lucide-react'
import { useDashboard }  from '../../hooks/useDashboard'
import { useApp }        from '../../hooks/useApp'
import Card              from '../../components/ui/Card'
import LeaderboardTable  from '../../components/leaderboard/LeaderboardTable'
import StatCard          from '../../components/ui/StatCard'
import Spinner           from '../../components/ui/Spinner'
import { formatPeriod, getPeriodOptions, getBadgeConfig } from '../../utils/formatters'

export default function GovLeaderboard() {
  const { stats, loading, period, setPeriod } = useDashboard()
  const periodOpts = getPeriodOptions(6)

  if (loading || !stats) return <Spinner center />

  const { rankings, kpis, region_name } = stats
  const top1 = rankings[0]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Peringkat Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {region_name} · {formatPeriod(period)}
          </p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm w-40">
          {periodOpts.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Sekolah Terdaftar"
          value={kpis.total_schools}
          sub="di wilayah ini"
          icon={<Trophy size={18} />}
          color="teal"
        />
        <StatCard
          label="Rata-rata Skor"
          value={kpis.avg_score}
          sub="dari 100 poin"
          icon={<Trophy size={18} />}
          color="amber"
        />
        <StatCard
          label="Sekolah Terbaik"
          value={top1 ? `#1 ${top1.school_name.split(' ')[0]}` : '—'}
          sub={top1 ? `${top1.total_score} poin` : 'Belum ada data'}
          icon={<Trophy size={18} />}
          color="amber"
        />
      </div>

      {/* Podium top 3 */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[rankings[1], rankings[0], rankings[2]].map((school, i) => {
            if (!school) return <div key={i} />
            const medals = ['🥈', '🥇', '🥉']
            const badgeCfg = school.badge ? getBadgeConfig(school.badge.tier) : null
            return (
              <div key={school.school_id}
                className={`card p-4 flex flex-col items-center text-center
                            ${i === 1 ? 'border-amber-300 bg-amber-50/40' : ''}`}>
                <span className="text-3xl mb-1">{medals[i]}</span>
                <p className="text-sm font-bold text-gray-900 truncate w-full">{school.school_name}</p>
                <p className="text-xs text-gray-500">{school.district}</p>
                <p className="text-xl font-black text-teal-700 mt-2">{school.total_score}</p>
                {badgeCfg && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${badgeCfg.className}`}>
                    {badgeCfg.emoji} {badgeCfg.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Full table with breakdown (gov can see full details) */}
      <Card
        title={`Peringkat Lengkap — ${region_name}`}
        subtitle={`${formatPeriod(period)} · ${rankings.length} sekolah`}
        noPadding
      >
        <LeaderboardTable rankings={rankings} showBreakdown loading={loading} />
      </Card>

      {/* Score explanation */}
      <Card title="Cara Penghitungan Skor" className="mt-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'LMS', max: 40, desc: 'Tingkat sertifikasi guru', color: 'text-teal-700' },
            { label: 'Kegiatan', max: 40, desc: 'Laporan tervalidasi', color: 'text-blue-700' },
            { label: 'Konsistensi', max: 20, desc: '3 bulan berturut-turut', color: 'text-amber-700' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <p className={`text-xs font-bold ${item.color}`}>{item.label}</p>
              <p className="text-2xl font-black text-gray-900">0–{item.max}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
