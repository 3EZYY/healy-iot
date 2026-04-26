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
