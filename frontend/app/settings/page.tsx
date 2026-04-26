'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchThresholds, updateThresholds, type ThresholdSettings } from '@/lib/api'
import { Save, RotateCcw, Loader2, CheckCircle, AlertCircle, Thermometer, Wind } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
} as const

// ─── Input Field Component ───
function ThresholdInput({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step = 0.1,
  hint,
}: {
  label: string
  value: number
  unit: string
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-healy-graphite mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          aria-label={`${label} threshold value in ${unit}`}
          className="
            w-full px-4 py-3 pr-14 rounded-xl
            bg-healy-bg border border-healy-border
            font-mono text-sm text-healy-graphite
            focus:outline-none focus:ring-2 focus:ring-healy-sage/30 focus:border-healy-sage
            transition-all duration-200
          "
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-body text-healy-slate">
          {unit}
        </span>
      </div>
      {hint && <p className="text-xs font-body text-healy-slate mt-1">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ThresholdSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<ThresholdSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await fetchThresholds()
        setSettings(data)
        setOriginalSettings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Check for unsaved changes
  const hasChanges = settings && originalSettings
    ? JSON.stringify(settings) !== JSON.stringify(originalSettings)
    : false

  // Reset to original
  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings })
      setSuccess('')
      setError('')
    }
  }

  // Save
  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setSuccess('')

    // Validation
    if (settings.temp_normal_min >= settings.temp_normal_max) {
      setError('Temperature Normal Min must be less than Normal Max')
      setSaving(false)
      return
    }
    if (settings.temp_normal_max >= settings.temp_warn_max) {
      setError('Temperature Normal Max must be less than Warning Max')
      setSaving(false)
      return
    }
    if (settings.spo2_warn_min >= settings.spo2_normal_min) {
      setError('SpO₂ Warning Min must be less than Normal Min')
      setSaving(false)
      return
    }

    try {
      const updated = await updateThresholds(settings)
      setSettings(updated)
      setOriginalSettings(updated)
      setSuccess('Threshold settings saved successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Field updater
  const updateField = (field: keyof ThresholdSettings) => (value: number) => {
    if (settings) setSettings({ ...settings, [field]: value })
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-healy-sage animate-spin mx-auto mb-3" />
          <p className="text-sm font-body text-healy-slate">Loading threshold settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-healy-critical mx-auto mb-3" />
          <p className="text-sm font-body text-healy-slate">{error || 'Unable to load settings'}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-healy-graphite">
            Threshold Settings
          </h1>
          <p className="text-sm font-body text-healy-slate mt-1">
            Configure alert thresholds for vital sign monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs font-body text-healy-warning bg-healy-warning/10 px-3 py-1.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
      </motion.div>

      {/* ─── Feedback Banners ─── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-healy-critical/5 border border-healy-critical/20 text-healy-critical text-sm font-body flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-healy-sage/5 border border-healy-sage/20 text-healy-sage-dark text-sm font-body flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </motion.div>
      )}

      {/* ─── Temperature Thresholds ─── */}
      <motion.div variants={fadeUp} className="glass-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-healy-sage/10 flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-healy-sage" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-healy-graphite">Temperature</h2>
            <p className="text-xs font-body text-healy-slate">Body temperature threshold ranges (°C)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThresholdInput
            label="Normal Min"
            value={settings.temp_normal_min}
            unit="°C"
            onChange={updateField('temp_normal_min')}
            min={34}
            max={38}
            hint="Below this → CRITICAL"
          />
          <ThresholdInput
            label="Normal Max"
            value={settings.temp_normal_max}
            unit="°C"
            onChange={updateField('temp_normal_max')}
            min={36}
            max={39}
            hint="Above this → WARNING"
          />
          <ThresholdInput
            label="Warning Max"
            value={settings.temp_warn_max}
            unit="°C"
            onChange={updateField('temp_warn_max')}
            min={37}
            max={42}
            hint="Above this → CRITICAL"
          />
        </div>

        {/* Visual threshold bar */}
        <div className="mt-6 pt-4 border-t border-healy-border/50">
          <p className="text-xs font-body text-healy-slate mb-2">Threshold Visualization</p>
          <div className="flex items-center h-8 rounded-lg overflow-hidden text-[10px] font-mono text-white" role="img" aria-label={`Temperature threshold visualization: Critical below ${settings.temp_normal_min}, Normal ${settings.temp_normal_min} to ${settings.temp_normal_max}, Warning ${settings.temp_normal_max} to ${settings.temp_warn_max}, Critical above ${settings.temp_warn_max}`}>
            <div className="bg-healy-critical/70 flex-1 flex items-center justify-center">
              &lt; {settings.temp_normal_min}
            </div>
            <div className="bg-healy-sage flex-2 flex items-center justify-center">
              {settings.temp_normal_min} — {settings.temp_normal_max}
            </div>
            <div className="bg-healy-warning flex-1 flex items-center justify-center">
              {settings.temp_normal_max} — {settings.temp_warn_max}
            </div>
            <div className="bg-healy-critical flex-1 flex items-center justify-center">
              &gt; {settings.temp_warn_max}
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-healy-slate mt-1">
            <span>CRITICAL</span>
            <span>NORMAL</span>
            <span>WARNING</span>
            <span>CRITICAL</span>
          </div>
        </div>
      </motion.div>

      {/* ─── SpO2 Thresholds ─── */}
      <motion.div variants={fadeUp} className="glass-card p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
            <Wind className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-healy-graphite">Blood Oxygen (SpO₂)</h2>
            <p className="text-xs font-body text-healy-slate">Oxygen saturation threshold levels (%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThresholdInput
            label="Normal Min"
            value={settings.spo2_normal_min}
            unit="%"
            onChange={updateField('spo2_normal_min')}
            min={90}
            max={100}
            step={1}
            hint="Below this → WARNING"
          />
          <ThresholdInput
            label="Warning Min"
            value={settings.spo2_warn_min}
            unit="%"
            onChange={updateField('spo2_warn_min')}
            min={80}
            max={95}
            step={1}
            hint="Below this → CRITICAL"
          />
        </div>

        {/* Visual threshold bar */}
        <div className="mt-6 pt-4 border-t border-healy-border/50">
          <p className="text-xs font-body text-healy-slate mb-2">Threshold Visualization</p>
          <div className="flex items-center h-8 rounded-lg overflow-hidden text-[10px] font-mono text-white" role="img" aria-label={`SpO₂ threshold visualization: Critical below ${settings.spo2_warn_min}, Warning ${settings.spo2_warn_min} to ${settings.spo2_normal_min}, Normal above ${settings.spo2_normal_min}`}>
            <div className="bg-healy-critical flex-1 flex items-center justify-center">
              &lt; {settings.spo2_warn_min}
            </div>
            <div className="bg-healy-warning flex-1 flex items-center justify-center">
              {settings.spo2_warn_min} — {settings.spo2_normal_min}
            </div>
            <div className="bg-healy-sage flex-2 flex items-center justify-center">
              ≥ {settings.spo2_normal_min}
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-healy-slate mt-1">
            <span>CRITICAL</span>
            <span>WARNING</span>
            <span className="text-right">NORMAL</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Action Buttons ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          disabled={!hasChanges || saving}
          aria-label="Reset threshold settings to last saved values"
          className="
            flex items-center gap-2 px-5 py-3 rounded-xl
            border border-healy-border text-healy-slate
            font-body text-sm font-medium
            hover:border-healy-sage hover:text-healy-graphite
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          aria-label={saving ? 'Saving threshold settings' : 'Save threshold settings changes'}
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-healy-sage text-white
            font-body text-sm font-medium
            hover:bg-healy-sage-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-card hover:shadow-card-hover
          "
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Save Changes
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}
