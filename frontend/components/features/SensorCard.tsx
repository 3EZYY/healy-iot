'use client'

import { motion } from 'framer-motion'
import { type SensorStatus } from '@/types/telemetry'
import StatusChip from './StatusChip'
import { Thermometer, Heart, Wind } from 'lucide-react'

interface SensorCardProps {
  title: string
  value: number
  unit: string
  status: SensorStatus
  icon: 'temperature' | 'bpm' | 'spo2'
  trend?: 'up' | 'down' | 'stable'
}

const ICON_MAP = {
  temperature: Thermometer,
  bpm: Heart,
  spo2: Wind,
}

const ICON_COLORS = {
  NORMAL:   'text-healy-sage',
  WARNING:  'text-healy-warning',
  CRITICAL: 'text-healy-critical',
}

export default function SensorCard({
  title,
  value,
  unit,
  status,
  icon,
  trend,
}: SensorCardProps) {
  const Icon = ICON_MAP[icon]
  const iconColor = ICON_COLORS[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="
        glass-card p-6
        flex flex-col gap-4
        group cursor-default
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            bg-healy-bg-alt
            transition-colors duration-200
            group-hover:bg-healy-mint/30
          `}>
            <Icon className={`w-5 h-5 ${iconColor} transition-colors duration-200`} />
          </div>
          <span className="text-sm font-body font-medium text-healy-slate">
            {title}
          </span>
        </div>
        <StatusChip status={status} size="sm" />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <motion.span
          key={value}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl font-mono font-normal text-healy-graphite tabular-nums tracking-tight"
        >
          {icon === 'temperature' ? value.toFixed(1) : value}
        </motion.span>
        <span className="text-sm font-body text-healy-slate ml-1">{unit}</span>
        {trend && (
          <span className={`
            ml-2 text-xs font-body
            ${trend === 'up' ? 'text-healy-critical' : trend === 'down' ? 'text-healy-sage' : 'text-healy-slate'}
          `}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </motion.div>
  )
}
