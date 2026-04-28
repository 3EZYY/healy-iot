// Blueprint §5.2 — WebSocket Hook
// Manages real-time connection to backend WS endpoint with exponential backoff reconnect.

import { useEffect, useRef, useState, useCallback } from 'react'
import { 
  TelemetryPayload, 
  ConnectionState, 
  SystemMessage,
  isSystemMessage,
  WebSocketMessage
} from '@/types/telemetry'

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000]

export function useWebSocket(
  url: string, 
  onMessage?: (data: WebSocketMessage) => void,
  onStatusChange?: (status: ConnectionState['status']) => void
) {
  const [data, setData] = useState<TelemetryPayload | null>(null)
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(null)
  const [conn, setConn] = useState<ConnectionState>({
    status: 'DISCONNECTED',
    lastUpdate: null,
    retryCount: 0,
  })
  
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const onMessageRef = useRef(onMessage)
  const onStatusRef = useRef(onStatusChange)

  useEffect(() => {
    onMessageRef.current = onMessage
    onStatusRef.current = onStatusChange
  }, [onMessage, onStatusChange])

  const connect = useCallback(function _connect() {
    const socket = new WebSocket(url)
    wsRef.current = socket

    socket.onopen = () => {
      retryRef.current = 0
      setConn(prev => ({ ...prev, status: 'CONNECTED', retryCount: 0 }))
      onStatusRef.current?.('CONNECTED')
    }

    socket.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data)
        onMessageRef.current?.(msg)

        if (isSystemMessage(msg)) {
          setSystemMessage(msg)
          setDeviceOnline(msg.status === 'device_connected')
          return
        }

        setData(msg)
        setConn(prev => ({ ...prev, lastUpdate: new Date() }))
      } catch (err) {
        console.error('Failed to parse WS message:', err)
      }
    }

    socket.onclose = () => {
      const delay = RECONNECT_DELAYS[Math.min(retryRef.current, RECONNECT_DELAYS.length - 1)]
      retryRef.current++
      setConn(prev => ({ ...prev, status: 'RECONNECTING', retryCount: retryRef.current }))
      onStatusRef.current?.('RECONNECTING')
      setDeviceOnline(false)
      
      setTimeout(() => _connect(), delay)
    }
  }, [url])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])

  return { data, conn, deviceOnline, systemMessage }
}
