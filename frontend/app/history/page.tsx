'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import StatusChip from '@/components/features/StatusChip'
import { fetchTelemetryHistory, type TelemetryRecord } from '@/lib/api'
import { Clock, TrendingUp, Thermometer, Heart, Wind, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// Blueprint §3.1 — Chart Colors mapped to design tokens
const CHART_COLORS = {
  temperature: '#4CAF82', // Sage Green
  bpm:         '#E05252', // Coral Red
  spo2:        '#3B82F6', // Blue accent
  grid:        '#D4E8DF', // Pale Sage border
  text:        '#5A7080', // Slate
} as const

const TIME_RANGES = [
  { value: '1h',  label: '1 Hour' },
  { value: '6h',  label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d',  label: '7 Days' },
] as const

// Format timestamp for chart axis
function formatTime(iso: string, range: string): string {
  const d = new Date(iso)
  if (range === '7d') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (range === '24h') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Compute stats
function computeStats(records: TelemetryRecord[]) {
  if (records.length === 0) return null
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const temps = records.map(r => r.sensor.temperature)
  const bpms = records.map(r => r.sensor.bpm)
  const spo2s = records.map(r => r.sensor.spo2)

  return {
    temperature: { min: Math.min(...temps), max: Math.max(...temps), avg: avg(temps) },
    bpm:         { min: Math.min(...bpms),  max: Math.max(...bpms),  avg: avg(bpms) },
    spo2:        { min: Math.min(...spo2s), max: Math.max(...spo2s), avg: avg(spo2s) },
    totalRecords: records.length,
    criticalCount: records.filter(r => r.status.overall === 'CRITICAL').length,
    warningCount:  records.filter(r => r.status.overall === 'WARNING').length,
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
} as const

export default function HistoryPage() {
  const [range, setRange] = useState<string>('1h')
  const [records, setRecords] = useState<TelemetryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchTelemetryHistory(range)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = computeStats(records)

  // Prepare chart data (chronological order)
  const chartData = records
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      time: formatTime(r.timestamp, range),
      temperature: r.sensor.temperature,
      bpm: r.sensor.bpm,
      spo2: r.sensor.spo2,
    }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload) return null
    return (
      <div className="glass-card p-3 !rounded-xl text-xs">
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

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-healy-graphite">
            Telemetry History
          </h1>
          <p className="text-sm font-body text-healy-slate mt-1">
            Historical sensor data with trend analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-healy-bg-alt rounded-xl p-1 gap-1">
            {TIME_RANGES.map(tr => (
              <button
                key={tr.value}
                onClick={() => setRange(tr.value)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-body font-medium
                  transition-all duration-200
                  ${range === tr.value
                    ? 'bg-healy-sage text-white shadow-sm'
                    : 'text-healy-slate hover:text-healy-graphite hover:bg-healy-surface'
                  }
                `}
              >
                {tr.label}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-healy-bg-alt text-healy-slate hover:text-healy-sage hover:bg-healy-sage/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* ─── Error State ─── */}
      {error && (
        <motion.div variants={fadeUp} className="glass-card p-6 mb-6 border-healy-critical/20">
          <div className="flex items-center gap-3 text-healy-critical">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-body">{error}</p>
            <button onClick={loadData} className="ml-auto text-xs font-body underline">Retry</button>
          </div>
        </motion.div>
      )}

      {/* ─── Loading State ─── */}
      {loading && (
        <motion.div variants={fadeUp} className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-healy-sage animate-spin mx-auto mb-3" />
            <p className="text-sm font-body text-healy-slate">Loading telemetry history...</p>
          </div>
        </motion.div>
      )}

      {/* ─── Main Content ─── */}
      {!loading && !error && (
        <>
          {/* Stats Summary */}
          {stats && (
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Records',  value: stats.totalRecords.toString(), icon: Clock,       color: 'text-healy-sage' },
                { label: 'Avg Temp', value: `${stats.temperature.avg.toFixed(1)}°C`, icon: Thermometer, color: 'text-healy-sage' },
                { label: 'Avg BPM',  value: Math.round(stats.bpm.avg).toString(),    icon: Heart,       color: 'text-healy-critical' },
                { label: 'Warnings', value: `${stats.warningCount + stats.criticalCount}`, icon: AlertCircle, color: stats.criticalCount > 0 ? 'text-healy-critical' : 'text-healy-warning' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-healy-bg-alt flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-body text-healy-slate block">{stat.label}</span>
                    <span className="text-lg font-mono text-healy-graphite">{stat.value}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Temperature Chart */}
          <motion.div variants={fadeUp} className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-healy-sage/10 flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-healy-sage" />
              </div>
              <h2 className="text-lg font-display font-semibold text-healy-graphite">Temperature Trend</h2>
            </div>
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
          </motion.div>

          {/* BPM & SpO2 Combined Chart */}
          <motion.div variants={fadeUp} className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-healy-critical/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-healy-critical" />
              </div>
              <h2 className="text-lg font-display font-semibold text-healy-graphite">Heart Rate & SpO₂</h2>
            </div>
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
          </motion.div>

          {/* Recent Records Table */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-healy-sage" />
              <h2 className="text-lg font-display font-semibold text-healy-graphite">Recent Records</h2>
              <span className="ml-auto text-xs font-mono text-healy-slate">
                Showing latest {Math.min(records.length, 20)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-healy-border">
                    <th className="text-left py-3 px-2 text-xs font-body font-medium text-healy-slate">Time</th>
                    <th className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">Temp (°C)</th>
                    <th className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">BPM</th>
                    <th className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">SpO₂ (%)</th>
                    <th className="text-center py-3 px-2 text-xs font-body font-medium text-healy-slate">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b border-healy-border/30 hover:bg-healy-bg-alt/30 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-xs text-healy-slate">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-healy-graphite">{r.sensor.temperature.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-healy-graphite">{r.sensor.bpm}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-healy-graphite">{r.sensor.spo2}</td>
                      <td className="py-2.5 px-2 text-center">
                        <StatusChip status={r.status.overall} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {records.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 text-healy-slate/30 mx-auto mb-3" />
                <p className="text-sm font-body text-healy-slate">No telemetry records found for this time range.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
