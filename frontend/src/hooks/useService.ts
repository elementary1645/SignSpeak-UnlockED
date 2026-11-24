import { useCallback, useEffect, useState } from 'react'
import { fetchService } from '../services/api'

type Service = Awaited<ReturnType<typeof fetchService>>
type Connection = { state: 'loading' | 'error' } | { state: 'connected'; service: Service }

export function useService() {
  const [connection, setConnection] = useState<Connection>({ state: 'loading' })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 5000)
    let active = true
    fetchService(controller.signal)
      .then(service => { if (active) setConnection({ state: 'connected', service }) })
      .catch(() => { if (active) setConnection({ state: 'error' }) })
      .finally(() => clearTimeout(timer))
    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [revision])
  const refresh = useCallback(() => {
    setConnection({ state: 'loading' })
    setRevision(value => value + 1)
  }, [])
  return { connection, refresh }
}
