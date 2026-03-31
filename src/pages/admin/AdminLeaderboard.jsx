import { useState } from 'react'
import { RefreshCw, Trophy } from 'lucide-react'
import { useApp }          from '../../hooks/useApp'
import { computeLeaderboard, recomputeScores } from '../../services/leaderboardService'
import regionsData         from '../../data/regions.json'
import Card                from '../../components/ui/Card'
import Button              from '../../components/ui/Button'
import LeaderboardTable    from '../../components/leaderboard/LeaderboardTable'
import { formatPeriod, getPeriodOptions } from '../../utils/formatters'

export default function AdminLeaderboard() {
  const { toast, period, setPeriod } = useApp()
  const [regionId,  setRegionId]   = useState('')
  const [loading,   setLoading]    = useState(false)

  const rankings    = computeLeaderboard(period, regionId || null)
  const periodOpts  = getPeriodOptions(6)

  async function handleRecompute() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = recomputeScores(period, regionId || null)
    setLoading(false)
    toast.success(`${result.recomputed} skor dihitung ulang untuk ${formatPeriod(period)}.`)
  }

  const top1 = rankings[0]
  const top2 = rankings[1]
  const top3 = rankings[2]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Peringkat Sekolah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rankings.length} sekolah · {formatPeriod(period)}
          </p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={14} />}
          loading={loading} onClick={handleRecompute}>
          Hitung Ulang
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm w-40">
          {periodOpts.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={regionId} onChange={e => setRegionId(e.target.value)} className="input text-sm w-52">
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* Podium top 3 */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { school: top2, rank: 2, medal: '🥈', height: 'h-20' },
            { school: top1, rank: 1, medal: '🥇', height: 'h-28' },
            { school: top3, rank: 3, medal: '🥉', height: 'h-16' },
          ].map(({ school, rank, medal, height }) => school && (
            <div key={school.school_id}
              className={`card p-4 flex flex-col items-center text-center
                          ${rank === 1 ? 'border-amber-300 bg-amber-50/40' : ''}`}>
              <span className="text-3xl mb-1">{medal}</span>
              <p className="text-sm font-bold text-gray-900 truncate w-full">{school.school_name}</p>
              <p className="text-xs text-gray-500 truncate w-full">{school.district}</p>
              <p className="text-xl font-black text-primary-700 mt-2">{school.total_score}</p>
              <p className="text-[10px] text-gray-400">poin</p>
            </div>
          ))}
        </div>
      )}

      {/* Full table */}
      <Card title="Peringkat Lengkap" subtitle={`${formatPeriod(period)} · ${rankings.length} sekolah`} noPadding>
        <LeaderboardTable rankings={rankings} showBreakdown loading={loading} />
      </Card>
    </div>
  )
}
