# Development setup

Use Bash, Python 3.12, Node.js 24 and npm. From the root:

```bash
./scripts/setup
cp .env.example .env
./scripts/dev
```

The setup script uses Python 3.12 for the backend environment and requires pip 22.3 or newer on your bootstrap `python3`. Dependency installation targets only the backend virtual environment. Codespaces installs dependencies through the dev container and forwards port 5173. Keep that port private during development. On Linux Chromium may need system packages. The CI configuration shows the Playwright install command with dependencies.

The optional root `.env` sets `SIGNSPEAK_ENVIRONMENT` (development, test or production), `SIGNSPEAK_DATABASE_URL` and a JSON array `SIGNSPEAK_CORS_ORIGINS`. Process environment values override file values. Use an explicit origin without path or wildcard. Same-origin frontend usage needs no CORS entries. The default SQLite file is `data/signspeak.sqlite3`. Use a writable parent directory for custom paths. The browser path talks to the Vite proxy, which defaults to loopback port 8000.

Run the server alone with `./scripts/backend`. Run the UI alone with `npm --prefix frontend run dev`. Phase 1 dev diagnostics appear at `/diagnostics`. See README for lint, test and build commands. Stop the development processes before Playwright, which owns its own test servers on ports 5173 and 8000.

For production, build with `npm --prefix frontend run build`, serve `frontend/dist` and route unmatched UI paths to `index.html`. Proxy `/api/` and `/ws/` to Uvicorn including WebSocket upgrades and the external Host. Run the backend with `SIGNSPEAK_ENVIRONMENT=production`. For HTTPS termination, configure trusted forwarded headers or list the exact public HTTPS origin. Restrict direct backend access. Production disables API docs and the frontend diagnostics route. Deployment infrastructure is deferred.
