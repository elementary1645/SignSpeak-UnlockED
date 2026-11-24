export type CapabilityState = 'available' | 'planned' | 'unavailable' | 'degraded'
export interface Capability { id: string; state: CapabilityState }
export interface ServiceStatus {
  status: 'ready' | 'degraded'
  database: 'ready' | 'unavailable'
  recognition: 'unavailable'
}

interface Envelope {
  schema_version: 1
  timestamp: string
}
export interface Hello extends Envelope { type: 'hello' }
export interface Ready extends Envelope { type: 'ready'; recognition: 'unavailable' }
export interface Ping extends Envelope { type: 'ping'; request_id: string }
export interface Pong extends Envelope { type: 'pong'; request_id: string }
export interface ProtocolError extends Envelope {
  type: 'error'
  code: 'invalid_message' | 'unexpected_message' | 'handshake_timeout'
}
