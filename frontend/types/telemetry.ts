// Blueprint §5.1 — TypeScript Interfaces (identical to Go structs in §4.1)

export type SensorStatus = 'NORMAL' | 'WARNING' | 'CRITICAL'

export interface SensorData {
  temperature: number
  bpm: number
  spo2: number
}

export interface EvaluatedStatus {
  temperature: SensorStatus
  spo2: SensorStatus
  overall: SensorStatus
}

export interface TelemetryPayload {
  device_id: string
  timestamp: string   // ISO 8601
  sensor: SensorData
  status: EvaluatedStatus
}

export interface ConnectionState {
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'
  lastUpdate: Date | null
  retryCount: number
}

// SystemMessage — pesan non-telemetry dari Hub
export interface SystemMessage {
  type: 'system'
  status: 'device_connected' | 'device_disconnected'
}

// Union type untuk semua pesan WebSocket yang mungkin diterima
export type WebSocketMessage = TelemetryPayload | SystemMessage

// Helper type guard
export function isSystemMessage(msg: WebSocketMessage): msg is SystemMessage {
  return (msg as SystemMessage).type === 'system'
}

// Alert dengan AI narrative (untuk Phase 11)
export interface AlertWithNarrative {
  id: string
  timestamp: Date
  alert_type: string
  value: number
  status: SensorStatus
  device_id: string
  // Narrative dari Groq — null saat sedang di-generate, string saat selesai
  narrative: string | null
  narrativeLoading: boolean
}
