import type { Hello, Ping, Pong, Ready } from '../types/contracts'

function envelope() {
  return { schema_version: 1 as const, timestamp: new Date().toISOString() }
}

function validMessage(raw: unknown): raw is Ready | Pong {
  if (typeof raw !== 'object' || raw === null) return false
  const message = raw as Partial<Omit<Ready & Omit<Pong, 'type'>, 'type'>> & { type?: string }
  return message.schema_version === 1 && typeof message.timestamp === 'string' &&
    /(Z|[+-]\d\d:\d\d)$/.test(message.timestamp) && Number.isFinite(Date.parse(message.timestamp)) &&
    ((message.type === 'ready' && message.recognition === 'unavailable') ||
      (message.type === 'pong' && typeof message.request_id === 'string'))
}

export function checkRecognition(onResult: (success: boolean) => void): () => void {
  const url = new URL('/ws/v1/recognition', window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  let socket: WebSocket
  try {
    socket = new WebSocket(url)
  } catch {
    onResult(false)
    return () => {}
  }
  let done = false
  let requestId: string | undefined
  const timer = window.setTimeout(() => finish(false), 5000)
  function cleanup() {
    done = true
    clearTimeout(timer)
    if (socket.readyState < WebSocket.CLOSING) socket.close()
  }
  function finish(success: boolean) {
    if (done) return
    cleanup()
    onResult(success)
  }
  socket.addEventListener('open', () => {
    if (done) return
    const hello: Hello = { ...envelope(), type: 'hello' }
    socket.send(JSON.stringify(hello))
  })
  socket.addEventListener('message', event => {
    if (done) return
    try {
      const message: unknown = JSON.parse(event.data)
      if (!validMessage(message)) return finish(false)
      if (message.type === 'ready' && !requestId) {
        requestId = crypto.randomUUID()
        const ping: Ping = { ...envelope(), type: 'ping', request_id: requestId }
        socket.send(JSON.stringify(ping))
      } else {
        finish(requestId !== undefined && message.type === 'pong' && message.request_id === requestId)
      }
    } catch {
      finish(false)
    }
  })
  socket.addEventListener('error', () => finish(false))
  socket.addEventListener('close', () => finish(false))
  return cleanup
}
