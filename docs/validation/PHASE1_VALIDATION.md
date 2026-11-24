# Phase 1 validation

The README lists the reproducible verification commands. Pytest exercises startup, SQLite, configuration, API responses and WebSocket validation. Vitest exercises route rendering, capability handling and mocked transport. Playwright runs a real browser with the local FastAPI backend and Vite proxy. It checks dashboard loading, route navigation, keyboard navigation, backend outages and a real WebSocket round trip.

Validation is limited to Phase 1 service and UI behaviour. Data collection, model performance, vocational assessment outcomes, credential authenticity and WCAG conformance are outside the tested scope.

## Local verification

Verified on Ubuntu 24.04 x86-64 with Python 3.12.3, Node.js 24.22.2 and npm 11.19.1.

| Check | Result |
| --- | --- |
| `./scripts/setup` | Installed into a fresh Python environment and ran `npm ci` |
| `backend/.venv/bin/ruff check backend` | Passed |
| `backend/.venv/bin/python -m pytest backend/tests` | 14 passed. Starlette emitted a deprecation warning about its HTTPX test adapter |
| `npm --prefix frontend run lint` and `npm --prefix frontend run typecheck` | Passed |
| `npm --prefix frontend test` | 5 passed |
| `npm --prefix frontend run build` | Passed. Development diagnostics text was absent from the bundle |
| `npm --prefix frontend run test:e2e` | 4 passed in Chromium after installing the browser and Linux system libraries |
| `./scripts/dev` | Both services started. All four API requests succeeded through Vite, and SQLite contained no domain tables |

The Chromium suite covered the keyboard skip link and horizontal overflow at a 360 px viewport. Manual screen reader and formal WCAG conformance testing are pending. CI and Codespaces configuration were authored for this repository. Container startup and port forwarding need independent verification in Codespaces.
