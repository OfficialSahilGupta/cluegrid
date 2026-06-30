# ClueGrid

> A real-time multiplayer word-deduction game. Decode the grid. Outfox the enemy.

## Monorepo Structure

```
cluegrid/
├── apps/
│   ├── web/          # React 18 + TypeScript + Tailwind v4 + Vite
│   └── server/       # Node.js + Express + Socket.IO + TypeScript
├── packages/
│   ├── shared/       # Shared TypeScript types (Card, Team, Player, GameState…)
│   ├── i18n/         # Locale JSON packs (en only in Phase 0)
│   └── wordpacks/    # Word lists per locale (400+ EN words)
├── docker-compose.yml
├── ci.sh
└── package.json      # npm workspaces root
```

## Quick Start

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- Docker (for Postgres + Redis)

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm run dev --workspace=apps/server
```

### 4. Start the web app (new terminal)
```bash
npm run dev --workspace=apps/web
```

- Web app: http://localhost:5173
- Server: http://localhost:3001
- Health check: http://localhost:3001/health

## Phase 0 Done-When

- [x] Repo boots locally
- [x] Types compile (`npm run type-check`)
- [x] Health check returns 200
- [x] "Hello World" page live on web

## Type Contracts (`@cluegrid/shared`)

| Type | Description |
|------|-------------|
| `Card` | A single word-card on the 5×5 grid |
| `Team` | One of the two competing teams |
| `Player` | A connected player in a room |
| `GameState` | Full game state broadcast to all clients |
| `TurnState` | Active turn phase, clue, guess counts |
| `ChatMessage` | In-room chat message |
| `HealthResponse` | Health check API response |

## CI

```bash
bash ci.sh
```

Or via npm: `npm run ci`

## License

MIT
