'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Activity, Thermometer, Heart, Wind, ArrowRight, Shield, Zap, Wifi } from 'lucide-react'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const FEATURES = [
  {
    icon: Thermometer,
    title: 'Body Temperature',
    description: 'MLX90614 infrared sensor for non-contact readings with ±0.2°C accuracy.',
    color: 'text-healy-sage',
    bgColor: 'bg-healy-sage/10',
  },
  {
    icon: Heart,
    title: 'Heart Rate (BPM)',
    description: 'MAX30102 photoplethysmographic sensor for real-time pulse oximetry.',
    color: 'text-healy-critical',
    bgColor: 'bg-healy-critical/10',
  },
  {
    icon: Wind,
    title: 'Blood Oxygen (SpO₂)',
    description: 'Continuous SpO₂ monitoring with threshold-based clinical alerts.',
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
  },
]

const CAPABILITIES = [
  { icon: Zap,    label: 'Real-time Streaming',    desc: 'Sub-second WebSocket delivery' },
  { icon: Shield, label: 'Threshold Engine',        desc: 'Automated clinical alerts' },
  { icon: Wifi,   label: 'IoT Connected',           desc: 'ESP32 wireless integration' },
]

export default function LandingPage() {
  return (
    <div className="hero-bg min-h-screen flex flex-col">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-healy-bg/80 backdrop-blur-md border-b border-healy-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-healy-sage flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-healy-graphite tracking-tight">
              HEALY
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8" aria-label="Landing page navigation">
            <a href="#features" className="text-sm font-body font-medium text-healy-slate hover:text-healy-sage transition-colors">Features</a>
            <a href="#capabilities" className="text-sm font-body font-medium text-healy-slate hover:text-healy-sage transition-colors">Capabilities</a>
            <Link
              href="/login"
              className="
                px-5 py-2 rounded-xl text-sm font-body font-medium
                bg-healy-sage text-white
                hover:bg-healy-sage-dark
                transition-all duration-200
                shadow-card hover:shadow-card-hover
              "
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="
                inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                bg-healy-sage/10 text-healy-sage-dark
                text-xs font-body font-medium
                border border-healy-sage/20
              ">
                <span className="w-1.5 h-1.5 rounded-full bg-healy-sage animate-pulse" />
                IoT Health Monitoring System
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-healy-graphite leading-tight tracking-tight"
            >
              Meet <span className="text-healy-sage">HEALY</span>
              <br />
              <span className="text-healy-slate text-4xl md:text-5xl lg:text-6xl font-semibold">
                Health Observer Robot
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-healy-slate font-body leading-relaxed max-w-2xl mx-auto"
            >
              Real-time body temperature, heart rate, and SpO₂ monitoring
              powered by ESP32 sensors with clinical-grade threshold alerts.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="
                  group flex items-center gap-2
                  px-8 py-3.5 rounded-2xl
                  bg-healy-sage text-white
                  font-body font-medium text-base
                  hover:bg-healy-sage-dark
                  transition-all duration-200
                  shadow-card hover:shadow-card-hover
                "
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="
                  px-8 py-3.5 rounded-2xl
                  border border-healy-border text-healy-graphite
                  font-body font-medium text-base
                  hover:border-healy-sage hover:text-healy-sage
                  transition-all duration-200
                "
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>

          {/* Mock Sensor Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Temperature', value: '36.8', unit: '°C', icon: Thermometer, color: 'text-healy-sage' },
                { label: 'Heart Rate',  value: '78',   unit: 'BPM', icon: Heart,       color: 'text-healy-critical' },
                { label: 'SpO₂',        value: '98',   unit: '%',  icon: Wind,        color: 'text-[#3B82F6]' },
              ].map((sensor, i) => (
                <motion.div
                  key={sensor.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                  className="flex flex-col items-center text-center p-4"
                >
                  <sensor.icon className={`w-8 h-8 ${sensor.color} mb-3`} />
                  <span className="text-3xl font-mono text-healy-graphite tabular-nums">
                    {sensor.value}
                  </span>
                  <span className="text-xs font-body text-healy-slate mt-1">
                    {sensor.unit}
                  </span>
                  <span className="text-xs font-body text-healy-sage mt-2 bg-healy-sage/10 px-2 py-0.5 rounded-full">
                    Normal
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Features Section ─── */}
        <section id="features" className="bg-healy-bg-alt/50 py-24 border-t border-healy-border/30" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h2 id="features-heading" className="text-3xl md:text-4xl font-display font-bold text-healy-graphite">
                Three Vital Sensors
              </h2>
              <p className="mt-3 text-healy-slate font-body text-lg max-w-xl mx-auto">
                Medical-grade monitoring with real-time threshold evaluation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="glass-card p-8 text-center"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto mb-5`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-healy-graphite mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-body text-healy-slate leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Capabilities Section ─── */}
        <section id="capabilities" className="py-24" aria-labelledby="capabilities-heading">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h2 id="capabilities-heading" className="text-3xl md:text-4xl font-display font-bold text-healy-graphite">
                Built for Reliability
              </h2>
              <p className="mt-3 text-healy-slate font-body text-lg max-w-xl mx-auto">
                Enterprise-grade architecture from sensor to screen
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-healy-surface border border-healy-border/50 hover:border-healy-sage/30 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-healy-sage/10 flex items-center justify-center shrink-0">
                    <cap.icon className="w-5 h-5 text-healy-sage" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-healy-graphite text-sm">{cap.label}</h3>
                    <p className="text-xs font-body text-healy-slate mt-1">{cap.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-healy-border/50 bg-healy-surface/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-healy-sage" />
            <span className="text-sm font-body text-healy-slate">
              HEALY Health Observer Robot
            </span>
          </div>
          <p className="text-xs font-body text-healy-slate">
            Built with ESP32 + Golang + Next.js — Clinical Futurism Design
          </p>
        </div>
      </footer>
    </div>
  )
}
