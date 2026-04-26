'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'

// Blueprint §3.1 — Chart Colors mapped to design tokens
const CHART_COLORS = {
  temperature: '#4CAF82', // Sage Green
  bpm:         '#E05252', // Coral Red
  spo2:        '#3B82F6', // Blue accent
  grid:        '#D4E8DF', // Pale Sage border
  text:        '#5A7080', // Slate
} as const

// Custom tooltip matching glass-card design
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="glass-card p-3 rounded-xl! text-xs" role="tooltip">
      <p className="font-mono text-healy-slate mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-body" style={{ color: entry.color }}>
          {entry.name}: <span className="font-mono font-medium">{entry.name === 'temperature' ? entry.value.toFixed(1) : entry.value}</span>
          {entry.name === 'temperature' ? '°C' : entry.name === 'bpm' ? ' BPM' : '%'}
        </p>
      ))}
    </div>
  )
}

export interface ChartDataPoint {
  time: string
  temperature: number
  bpm: number
  spo2: number
}

interface HistoryChartsProps {
  chartData: ChartDataPoint[]
}

export default function HistoryCharts({ chartData }: HistoryChartsProps) {
  return (
    <>
      {/* Temperature Area Chart */}
      <div role="img" aria-label="Temperature trend chart showing body temperature over time">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.temperature} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS.temperature} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: CHART_COLORS.text }} interval="preserveStartEnd" />
            <YAxis domain={[35, 40]} tick={{ fontSize: 10, fill: CHART_COLORS.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temperature" stroke={CHART_COLORS.temperature} fill="url(#tempGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* BPM & SpO2 Line Chart — rendered separately for readability */}
      <div role="img" aria-label="Heart rate and blood oxygen chart showing BPM and SpO₂ over time">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: CHART_COLORS.text }} interval="preserveStartEnd" />
            <YAxis yAxisId="bpm" domain={[50, 120]} tick={{ fontSize: 10, fill: CHART_COLORS.text }} />
            <YAxis yAxisId="spo2" orientation="right" domain={[80, 100]} tick={{ fontSize: 10, fill: CHART_COLORS.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans' }} />
            <Line yAxisId="bpm" type="monotone" dataKey="bpm" stroke={CHART_COLORS.bpm} strokeWidth={2} dot={false} name="BPM" />
            <Line yAxisId="spo2" type="monotone" dataKey="spo2" stroke={CHART_COLORS.spo2} strokeWidth={2} dot={false} name="SpO₂ %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
