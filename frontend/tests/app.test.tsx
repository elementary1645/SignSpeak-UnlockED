import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { App } from '../src/App'

function mockService(state = 'planned') {
  return vi.fn(async (url: string) => Response.json(url.endsWith('/status')
    ? { status: 'ready', database: 'ready', recognition: 'unavailable' }
    : [{ id: 'vocational_learning', state }]))
}

function show(path = '/') {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

test('renders the dashboard and exposes keyboard navigation landmarks', async () => {
  vi.stubGlobal('fetch', mockService())
  show()
  await userEvent.tab()
  expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus()
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  expect(screen.getByRole('heading', { level: 1, name: 'Skill Without Barriers' })).toBeVisible()
  expect(await screen.findByText('Backend connected')).toBeVisible()
})

test('navigates to learning and consumes server capability status', async () => {
  const fetcher = mockService('degraded')
  vi.stubGlobal('fetch', fetcher)
  show()
  await screen.findByText('Backend connected')
  const nav = screen.getByRole('navigation')
  await userEvent.click(within(nav).getByRole('link', { name: 'Learn' }))
  expect(screen.getByRole('heading', { name: 'Learn', level: 1 })).toBeVisible()
  expect(screen.getByText('Degraded')).toBeVisible()
  expect(screen.getByRole('main')).toHaveFocus()
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual(['/api/v1/status', '/api/v1/capabilities'])
})

test('reports loading, fails malformed responses safely and recovers on retry', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ unexpected: true })))
  show()
  expect(screen.getByRole('status')).toHaveTextContent('Checking backend')
  expect(await screen.findByRole('alert')).toHaveTextContent('Backend unavailable')
  vi.stubGlobal('fetch', mockService())
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('Backend connected')).toBeVisible()
})

class FakeSocket extends EventTarget {
  static CLOSING = 2
  static last: FakeSocket
  readyState = 1
  send = vi.fn()
  close = vi.fn()
  constructor(public url: URL) {
    super()
    FakeSocket.last = this
  }
  receive(message: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(message) }))
  }
}

test('checks WebSocket handshake and matching heartbeat without a sign prediction', async () => {
  vi.stubGlobal('fetch', mockService())
  vi.stubGlobal('WebSocket', FakeSocket)
  show('/recognition')
  await userEvent.click(screen.getByRole('button', { name: 'Check connection' }))
  const socket = FakeSocket.last
  expect(socket.url.pathname).toBe('/ws/v1/recognition')
  socket.dispatchEvent(new Event('open'))
  expect(JSON.parse(socket.send.mock.calls[0][0])).toMatchObject({ type: 'hello', schema_version: 1 })
  const envelope = { schema_version: 1, timestamp: '2026-01-01T00:00:00Z' }
  socket.receive({ ...envelope, type: 'ready', recognition: 'unavailable' })
  const ping = JSON.parse(socket.send.mock.calls[1][0])
  expect(ping.type).toBe('ping')
  socket.receive({ ...envelope, type: 'pong', request_id: ping.request_id })
  expect(await screen.findByText('Handshake and heartbeat verified. Sign recognition is unavailable.')).toBeVisible()
  expect(socket.close).toHaveBeenCalledOnce()
})

test('announces a failed WebSocket connection', async () => {
  vi.stubGlobal('fetch', mockService())
  vi.stubGlobal('WebSocket', FakeSocket)
  show('/recognition')
  await screen.findByText('Backend connected')
  await userEvent.click(screen.getByRole('button', { name: 'Check connection' }))
  FakeSocket.last.dispatchEvent(new Event('error'))
  expect(await screen.findByRole('alert')).toHaveTextContent('connection check failed')
})
