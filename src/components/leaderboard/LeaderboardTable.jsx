/**
 * LeaderboardTable — reusable ranked school table used by all three roles.
 *
 * Props:
 *   rankings     computed leaderboard array from leaderboardService
 *   showBreakdown boolean — show LMS/Activity/Bonus columns (admin + gov only)
 *   loading      boolean
 *   period       string
 */
import { Trophy } from 'lucide-react'
import ProgressBar  from '../ui/ProgressBar'
import Badge        from '../ui/Badge'
import Spinner      from '../ui/Spinner'
import EmptyState   from '../ui/EmptyState'
import { getRankEmoji, getBadgeConfig } from '../../utils/formatters'

export default function LeaderboardTable({ rankings = [], showBreakdown = false, loading = false }) {
  if (loading) return <Spinner center />
  if (!rankings.length) return (
    <EmptyState
      icon={<Trophy size={28} />}
      title="Belum ada data peringkat"
      message="Skor akan muncul setelah laporan divalidasi."
      compact
    />
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="th w-14 text-center">Rank</th>
            <th className="th">Sekolah</th>
            {showBreakdown && (
              <>
                <th className="th w-20 text-center">LMS</th>
                <th className="th w-24 text-center">Kegiatan</th>
                <th className="th w-20 text-center">Bonus</th>
              </>
            )}
            <th className="th w-28">Skor</th>
            <th className="th w-24 text-center">Badge</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((school) => {
            const badgeCfg = school.badge ? getBadgeConfig(school.badge.tier) : null
            const top3     = school.rank <= 3

            return (
              <tr
                key={school.school_id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  top3 ? 'bg-amber-50/40' : ''
                }`}
              >
                {/* Rank */}
                <td className="td text-center font-bold text-base">
                  {getRankEmoji(school.rank)}
                </td>

                {/* School info */}
                <td className="td">
                  <p className="font-semibold text-gray-900 text-sm">{school.school_name}</p>
                  <p className="text-xs text-gray-500">{school.district}</p>
                </td>

                {/* Breakdown columns */}
                {showBreakdown && (
                  <>
                    <td className="td text-center">
                      <span className="text-sm font-medium text-teal-700">{school.lms_score}</span>
                      <span className="text-xs text-gray-400">/40</span>
                    </td>
                    <td className="td text-center">
                      <span className="text-sm font-medium text-blue-700">{school.activity_score}</span>
                      <span className="text-xs text-gray-400">/40</span>
                    </td>
                    <td className="td text-center">
                      <span className="text-sm font-medium text-amber-700">+{school.consistency_bonus}</span>
                    </td>
                  </>
                )}

                {/* Score bar */}
                <td className="td">
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={school.total_score}
                      size="xs"
                      color={school.total_score >= 70 ? 'teal' : school.total_score >= 40 ? 'amber' : 'red'}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-gray-800 w-8 text-right shrink-0">
                      {school.total_score}
                    </span>
                  </div>
                </td>

                {/* Badge */}
                <td className="td text-center">
                  {badgeCfg ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${badgeCfg.className}`}>
                      {badgeCfg.emoji}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
