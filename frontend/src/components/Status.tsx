import type { CapabilityState } from '../types/contracts'

const labels = {
  available: 'Available', planned: 'Planned', unavailable: 'Unavailable', degraded: 'Degraded',
}

export function Status({ state }: { state: CapabilityState }) {
  return <span className={`status ${state}`}>{labels[state]}</span>
}
