// Centralized REST API client for HEALY backend.
// Reads NEXT_PUBLIC_API_URL and attaches JWT from localStorage.
// In mock mode (NEXT_PUBLIC_USE_MOCK_DATA=true), returns realistic mock responses.

import type { TelemetryPayload, SensorStatus } from '@/types/telemetry'
import { generateMockPayload } from '@/lib/mock-telemetry'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// ─── Auth Header Helper ───
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('healy_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ─── Types for API Responses ───

export interface TelemetryRecord {
  device_id: string
  recorded_at: string
  temperature: number
  bpm: number
  spo2: number
  temp_status: SensorStatus
  spo2_status: SensorStatus
  overall_status: SensorStatus
}

export interface ThresholdSettings {
  temp_normal_min: number
  temp_normal_max: number
  temp_warn_max: number
  spo2_normal_min: number
  spo2_warn_min: number
}

export interface DeviceStatus {
  device_id: string
  is_online: boolean
  last_seen: string
}

// ─── Mock Data Generators ───

function generateMockHistory(range: string): TelemetryRecord[] {
  const counts: Record<string, number> = { '1h': 30, '6h': 90, '24h': 200, '7d': 500 }
  const count = counts[range] || 60
  const now = Date.now()
  const rangeMs: Record<string, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
  }
  const totalMs = rangeMs[range] || 3600000
  const step = totalMs / count

  return Array.from({ length: count }, (_, i) => {
    const payload = generateMockPayload()
    return {
      device_id: payload.device_id,
      recorded_at: new Date(now - (count - i) * step).toISOString(),
      temperature: payload.sensor.temperature,
      bpm: payload.sensor.bpm,
      spo2: payload.sensor.spo2,
      temp_status: payload.status.temperature,
      spo2_status: payload.status.spo2,
      overall_status: payload.status.overall,
    }
  })
}

// ─── API Functions ───

/**
 * GET /api/telemetry/history?range=1h|6h|24h|7d
 * Returns historical telemetry records, ordered by recorded_at DESC.
 */
export async function fetchTelemetryHistory(range: string = '1h'): Promise<TelemetryRecord[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600)) // Simulate network latency
    return generateMockHistory(range)
  }

  const res = await fetch(`${API_URL}/telemetry/history?range=${range}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`)
  return res.json()
}

/**
 * GET /api/telemetry/latest
 * Returns the most recent telemetry payload.
 */
export async function fetchLatestTelemetry(): Promise<TelemetryPayload> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300))
    return generateMockPayload()
  }

  const res = await fetch(`${API_URL}/telemetry/latest`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Latest fetch failed: ${res.status}`)
  return res.json()
}

/**
 * GET /api/settings/threshold
 * Returns current threshold configuration.
 */
export async function fetchThresholds(): Promise<ThresholdSettings> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400))
    return {
      temp_normal_min: 36.5,
      temp_normal_max: 37.5,
      temp_warn_max: 38.5,
      spo2_normal_min: 95,
      spo2_warn_min: 91,
    }
  }

  const res = await fetch(`${API_URL}/settings/threshold`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Threshold fetch failed: ${res.status}`)
  return res.json()
}

/**
 * PUT /api/settings/threshold
 * Updates threshold configuration.
 */
export async function updateThresholds(settings: ThresholdSettings): Promise<ThresholdSettings> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500))
    return settings // Echo back
  }

  const res = await fetch(`${API_URL}/settings/threshold`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error(`Threshold update failed: ${res.status}`)
  return res.json()
}

/**
 * GET /api/device/status
 * Returns ESP32 device connection status.
 */
export async function fetchDeviceStatus(): Promise<DeviceStatus> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300))
    return {
      device_id: 'healy-001',
      is_online: true,
      last_seen: new Date().toISOString(),
    }
  }

  const res = await fetch(`${API_URL}/device/status`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Device status fetch failed: ${res.status}`)
  return res.json()
}
