import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const backend = 'http://127.0.0.1:8000'
const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN } = process.env
const allowedHosts = CODESPACE_NAME && GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
  ? [`${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`]
  : []
const proxy = { '/api': backend, '/ws': { target: backend, ws: true } }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy, strictPort: true, allowedHosts },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
  },
})
