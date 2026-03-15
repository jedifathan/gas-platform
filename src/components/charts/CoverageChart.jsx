/**
 * CoverageChart — horizontal stacked bar showing school reporting coverage per region.
 *
 * Props:
 *   data  { region_name, reporting, total, pct }[]
 */
export default function CoverageChart({ data = [] }) {
  if (!data.length) return (
    <p className="text-sm text-gray-400 py-4 text-center">Tidak ada data cakupan.</p>
  )

  return (
    <div className="space-y-4">
      {data.map(row => (
        <div key={row.region_id ?? row.region_name}>
          {/* Label row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700 truncate max-w-[60%]">
              {row.region_name}
            </span>
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              {row.reporting}/{row.total} sekolah &nbsp;·&nbsp;
              <span className={`font-semibold ${
                row.pct >= 75 ? 'text-teal-600' :
                row.pct >= 40 ? 'text-amber-600' : 'text-red-500'
              }`}>{row.pct}%</span>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                row.pct >= 75 ? 'bg-teal-500' :
                row.pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
