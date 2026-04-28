'use client'
import { motion } from 'framer-motion'

interface DeviceLedIndicatorProps {
  online: boolean
  className?: string
}

export function DeviceLedIndicator({ online, className = '' }: DeviceLedIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-3 w-3">
        {online && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-healy-device-on opacity-75"
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 transition-colors duration-500 ${
            online ? 'bg-healy-device-on' : 'bg-healy-device-off'
          }`}
        />
      </div>
      <span className="text-xs font-mono text-healy-slate">
        {online ? 'Device Online' : 'Device Offline'}
      </span>
    </div>
  )
}
