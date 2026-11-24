import { useEffect, useRef, useState } from 'react'
import { checkRecognition } from '../services/recognition'

export function RecognitionCheck() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const cancel = useRef<() => void>(undefined)
  useEffect(() => () => cancel.current?.(), [])
  function check() {
    if (status === "checking") return
    cancel.current?.()
    setStatus('checking')
    cancel.current = checkRecognition(success => setStatus(success ? 'success' : 'error'))
  }
  return <section className="panel recognition-check" aria-labelledby="connection-title">
    <h2 id="connection-title">Recognition connection</h2>
    <p>Check the server connection for future sign recognition. The gesture camera runs separately in your browser.</p>
    <button type="button" onClick={check} aria-disabled={status === 'checking'}>Check connection</button>
    <p role="status">
      {status === 'checking' && 'Checking the connection…'}
      {status === 'success' && 'Handshake and heartbeat verified. Sign recognition is unavailable.'}
    </p>
    {status === 'error' && <p role="alert">The recognition connection check failed. You can try again.</p>}
  </section>
}
