import type { Capability, CapabilityState, ServiceStatus } from '../types/contracts'

const states = new Set<unknown>(['available', 'planned', 'unavailable', 'degraded'])
function isCapability(value: unknown): value is Capability {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' && 'state' in value && states.has(value.state)
}

function isServiceStatus(value: unknown): value is ServiceStatus {
  return typeof value === 'object' && value !== null &&
    'status' in value && (value.status === 'ready' || value.status === 'degraded') &&
    'database' in value && (value.database === 'ready' || value.database === 'unavailable') &&
    'recognition' in value && value.recognition === 'unavailable'
}

async function request(resource: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`/api/v1/${resource}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Service request failed')
  return response.json()
}

export async function fetchService(signal: AbortSignal): Promise<{
  status: ServiceStatus
  capabilities: ReadonlyMap<string, CapabilityState>
}> {
  const [status, capabilities] = await Promise.all([request('status', signal), request('capabilities', signal)])
  if (!isServiceStatus(status) || !Array.isArray(capabilities) || !capabilities.every(isCapability)) {
    throw new Error('Service response was invalid')
  }
  return { status, capabilities: new Map(capabilities.map(({ id, state }) => [id, state])) }
}
