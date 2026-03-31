import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { computeLeaderboard } from '../../services/leaderboardService'
import regionsData from '../../data/regions.json'
import { formatPeriod, getPeriodOptions, getBadgeConfig, getRankEmoji } from '../../utils/formatters'
import ProgressBar from '../../components/ui/ProgressBar'

export default function PublicLeaderboard() {
  const [period,   setPeriod]   = useState('2025-02')
  const [regionId, setRegionId] = useState('')

  const rankings = computeLeaderboard(period, regionId || null)
  const periods  = getPeriodOptions(6)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200
                        flex items-center justify-center mx-auto mb-4">
          <Trophy size={24} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Peringkat Sekolah GAS</h1>
        <p className="text-sm text-gray-500">
          Skor dihitung dari kelengkapan pelatihan guru, laporan kegiatan, dan konsistensi program.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="input text-sm flex-1"
        >
          {periods.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={regionId}
          onChange={e => setRegionId(e.target.value)}
          className="input text-sm flex-1"
        >
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Period label */}
      <p className="text-xs text-gray-500 mb-4 text-center">
        Menampilkan {rankings.length} sekolah · {formatPeriod(period)}
        {regionId ? ` · ${regionsData.find(r => r.id === regionId)?.name}` : ''}
      </p>

      {/* Rankings */}
      {rankings.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 text-sm">
          Belum ada data skor untuk periode dan wilayah ini.
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((school) => {
            const badgeCfg = school.badge ? getBadgeConfig(school.badge.tier) : null
            const rankEmoji = getRankEmoji(school.rank)
            const top3 = school.rank <= 3

            return (
              <div
                key={school.school_id}
                className={`card p-5 transition-colors ${
                  top3 ? 'border-amber-200 bg-amber-50/30' : 'hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={`text-xl font-black w-10 text-center shrink-0 ${
                    top3 ? '' : 'text-gray-400 text-base pt-1'
                  }`}>
                    {rankEmoji}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {school.school_name}
                      </h3>
                      {badgeCfg && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeCfg.className}`}>
                          {badgeCfg.emoji} {badgeCfg.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{school.district}</p>

                    {/* Score bar */}
                    <ProgressBar
                      value={school.total_score}
                      color={school.total_score >= 70 ? 'teal' : school.total_score >= 40 ? 'amber' : 'red'}
                      size="sm"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>LMS {school.lms_score} + Kegiatan {school.activity_score} + Bonus {school.consistency_bonus}</span>
                      <span className="font-semibold text-gray-600">{school.total_score}/100</span>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className={`shrink-0 text-right ${top3 ? '' : 'hidden sm:block'}`}>
                    <p className={`text-2xl font-black ${
                      school.total_score >= 70 ? 'text-primary-600' :
                      school.total_score >= 40 ? 'text-amber-600' : 'text-gray-500'
                    }`}>{school.total_score}</p>
                    <p className="text-[10px] text-gray-400">poin</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Score legend */}
      <div className="mt-8 card p-5">
        <p className="text-xs font-semibold text-gray-700 mb-3">Cara Penghitungan Skor</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'LMS',         max: 40, desc: 'Pelatihan guru' },
            { label: 'Kegiatan',    max: 40, desc: 'Laporan tervalidasi' },
            { label: 'Konsistensi', max: 20, desc: 'Laporan berturut-turut' },
          ].map(item => (
            <div key={item.label} className="bg-alabaster rounded-lg p-3">
              <p className="text-xs font-bold text-primary-700">{item.label}</p>
              <p className="text-lg font-black text-gray-900">0–{item.max}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
