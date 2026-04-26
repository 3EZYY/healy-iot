'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import StatusChip from '@/components/features/StatusChip'
import { fetchTelemetryHistory, type TelemetryRecord } from '@/lib/api'
import { Clock, TrendingUp, Thermometer, Heart, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import type { ChartDataPoint } from '@/components/features/HistoryCharts'

// ─── Lazy-load Recharts (SSR disabled — Recharts depends on browser APIs) ───
const HistoryCharts = dynamic(
  () => import('@/components/features/HistoryCharts'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        {/* Temperature chart skeleton */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-healy-sage/10 animate-pulse" />
            <div className="h-5 w-40 bg-healy-bg-alt rounded-lg animate-pulse" />
          </div>
          <div className="w-full h-70 bg-healy-bg-alt/50 rounded-xl animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-healy-sage/30 animate-spin" />
          </div>
        </div>
        {/* BPM/SpO2 chart skeleton */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-healy-critical/10 animate-pulse" />
            <div className="h-5 w-44 bg-healy-bg-alt rounded-lg animate-pulse" />
          </div>
          <div className="w-full h-70 bg-healy-bg-alt/50 rounded-xl animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-healy-critical/30 animate-spin" />
          </div>
        </div>
      </div>
    ),
  }
)

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
    // Avoid synchronous setState by pushing to the next tick
    const timer = setTimeout(() => {
      loadData()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadData])

  const stats = computeStats(records)

  // Prepare chart data (chronological order)
  const chartData: ChartDataPoint[] = records
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      time: formatTime(r.timestamp, range),
      temperature: r.sensor.temperature,
      bpm: r.sensor.bpm,
      spo2: r.sensor.spo2,
    }))

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
          <div className="flex bg-healy-bg-alt rounded-xl p-1 gap-1" role="group" aria-label="Time range selector">
            {TIME_RANGES.map(tr => (
              <button
                key={tr.value}
                onClick={() => setRange(tr.value)}
                aria-label={`Show ${tr.label} range`}
                aria-pressed={range === tr.value}
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
            aria-label="Refresh telemetry data"
            className="p-2.5 rounded-xl bg-healy-bg-alt text-healy-slate hover:text-healy-sage hover:bg-healy-sage/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </motion.div>

      {/* ─── Error State ─── */}
      {error && (
        <motion.div variants={fadeUp} className="glass-card p-6 mb-6 border-healy-critical/20" role="alert">
          <div className="flex items-center gap-3 text-healy-critical">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            <p className="text-sm font-body">{error}</p>
            <button onClick={loadData} aria-label="Retry loading data" className="ml-auto text-xs font-body underline">Retry</button>
          </div>
        </motion.div>
      )}

      {/* ─── Loading State ─── */}
      {loading && (
        <motion.div variants={fadeUp} className="flex items-center justify-center py-20" role="status" aria-label="Loading telemetry history">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-healy-sage animate-spin mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-body text-healy-slate">Loading telemetry history...</p>
          </div>
        </motion.div>
      )}

      {/* ─── Main Content ─── */}
      {!loading && !error && (
        <>
          {/* Stats Summary */}
          {stats && (
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="Telemetry statistics summary">
              {[
                { label: 'Records',  value: stats.totalRecords.toString(), icon: Clock,       color: 'text-healy-sage' },
                { label: 'Avg Temp', value: `${stats.temperature.avg.toFixed(1)}°C`, icon: Thermometer, color: 'text-healy-sage' },
                { label: 'Avg BPM',  value: Math.round(stats.bpm.avg).toString(),    icon: Heart,       color: 'text-healy-critical' },
                { label: 'Warnings', value: `${stats.warningCount + stats.criticalCount}`, icon: AlertCircle, color: stats.criticalCount > 0 ? 'text-healy-critical' : 'text-healy-warning' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-healy-bg-alt flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-body text-healy-slate block">{stat.label}</span>
                    <span className="text-lg font-mono text-healy-graphite">{stat.value}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ─── Charts (Lazy-loaded via next/dynamic) ─── */}
          <motion.div variants={fadeUp} className="space-y-6 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-healy-sage/10 flex items-center justify-center">
                  <Thermometer className="w-4 h-4 text-healy-sage" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-display font-semibold text-healy-graphite">Temperature Trend</h2>
              </div>
              <div className="mb-10">
                {/* Temperature AreaChart + BPM/SpO2 LineChart are rendered together */}
                <HistoryCharts chartData={chartData} />
              </div>
              <div className="flex items-center gap-3 mb-6 pt-6 border-t border-healy-border/30">
                <div className="w-8 h-8 rounded-lg bg-healy-critical/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-healy-critical" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-display font-semibold text-healy-graphite">Heart Rate & SpO₂</h2>
              </div>
            </div>
          </motion.div>

          {/* Recent Records Table */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-healy-sage" aria-hidden="true" />
              <h2 className="text-lg font-display font-semibold text-healy-graphite">Recent Records</h2>
              <span className="ml-auto text-xs font-mono text-healy-slate">
                Showing latest {Math.min(records.length, 20)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Recent telemetry records">
                <thead>
                  <tr className="border-b border-healy-border">
                    <th scope="col" className="text-left py-3 px-2 text-xs font-body font-medium text-healy-slate">Time</th>
                    <th scope="col" className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">Temp (°C)</th>
                    <th scope="col" className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">BPM</th>
                    <th scope="col" className="text-right py-3 px-2 text-xs font-body font-medium text-healy-slate">SpO₂ (%)</th>
                    <th scope="col" className="text-center py-3 px-2 text-xs font-body font-medium text-healy-slate">Status</th>
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
                <Clock className="w-8 h-8 text-healy-slate/30 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-body text-healy-slate">No telemetry records found for this time range.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
