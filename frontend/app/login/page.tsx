'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use mock login for development if NEXT_PUBLIC_USE_MOCK_DATA is true
      const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

      if (useMock) {
        const demoUser = process.env.NEXT_PUBLIC_DEMO_USER || 'admin'
        const demoPass = process.env.NEXT_PUBLIC_DEMO_PASS || 'healy123'

        if (username === demoUser && password === demoPass) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800))
          localStorage.setItem('healy_token', 'mock-jwt-token-dev')
          router.push('/dashboard')
          return
        } else {
          throw new Error('Invalid username or password')
        }
      }

      // Real API call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('healy_token', data.token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-healy-sage flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-display font-bold text-healy-graphite tracking-tight">
                HEALY
              </h1>
              <p className="text-xs font-body text-healy-slate -mt-0.5">
                Health Observer Robot
              </p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-semibold text-healy-graphite">
              Welcome Back
            </h2>
            <p className="text-sm font-body text-healy-slate mt-1">
              Sign in to your monitoring dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-healy-critical/5 border border-healy-critical/20 text-healy-critical text-sm font-body"
              >
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-body font-medium text-healy-graphite mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-healy-bg border border-healy-border
                  font-body text-sm text-healy-graphite
                  placeholder:text-healy-slate/50
                  focus:outline-none focus:ring-2 focus:ring-healy-sage/30 focus:border-healy-sage
                  transition-all duration-200
                "
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-body font-medium text-healy-graphite mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="
                    w-full px-4 py-3 pr-12 rounded-xl
                    bg-healy-bg border border-healy-border
                    font-body text-sm text-healy-graphite
                    placeholder:text-healy-slate/50
                    focus:outline-none focus:ring-2 focus:ring-healy-sage/30 focus:border-healy-sage
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-healy-slate hover:text-healy-graphite transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? 'Signing in, please wait' : 'Sign in to dashboard'}
              className="
                w-full flex items-center justify-center gap-2
                px-6 py-3.5 rounded-xl
                bg-healy-sage text-white
                font-body font-medium text-sm
                hover:bg-healy-sage-dark
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-card hover:shadow-card-hover
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dev Hint */}
          {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && (
            <div className="mt-6 p-3 rounded-xl bg-healy-bg-alt border border-healy-border/50">
              <p className="text-xs font-mono text-healy-slate text-center">
                Demo: <span className="text-healy-sage-dark font-medium">admin</span> / <span className="text-healy-sage-dark font-medium">healy123</span>
              </p>
            </div>
          )}
        </div>

        {/* Back to landing */}
        <p className="text-center mt-6 text-sm font-body text-healy-slate">
          <Link href="/" className="hover:text-healy-sage transition-colors">
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
