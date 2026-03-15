/**
 * BarChart — Recharts wrapper for simple bar/column charts.
 *
 * Props:
 *   data        { name, value, [value2] }[]
 *   bars        { key, color, label }[]  — which keys to render as bars
 *   height      number  (default 220)
 *   xKey        string  (default 'name')
 *   showGrid    boolean (default true)
 *   showLegend  boolean (default false)
 *   formatter   (value) => string  — tooltip value formatter
 */
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'

const DEFAULT_BARS = [{ key: 'value', color: '#0F6E56', label: 'Nilai' }]

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function BarChart({
  data        = [],
  bars        = DEFAULT_BARS,
  height      = 220,
  xKey        = 'name',
  showGrid    = true,
  showLegend  = false,
  formatter,
  className   = '',
}) {
  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="35%">
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          )}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: '#f9fafb' }} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.label ?? b.key}
                 fill={b.color ?? '#0F6E56'} radius={[4, 4, 0, 0]} maxBarSize={48} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
