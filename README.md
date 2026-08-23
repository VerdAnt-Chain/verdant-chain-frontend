# VerdAnt Frontend

**The user-facing application for the VerdAnt ecosystem — open agricultural technology & financial infrastructure built on Stellar/Soroban.**

VerdAnt is a full-stack ecosystem that anchors farm identity, verification, equipment leasing, financing, and livestock provenance on Stellar/Soroban while keeping documents and media off-chain.

This repository delivers:

- **Four working product cores** — AgroProof (proofs), AgriLease (equipment + leases), FarmFund (projects + milestones), LivestockPass (animals + provenance) — each with explorer, detail, create, and mutation journeys backed by typed API clients
- **AgriScout** discovery + farmer profiles against the Farmer API
- **SEP-40 Freighter wallet authentication** with persistent bearer sessions
- A **Material 3 Expressive design system** ('digital greenhouse' identity: botanical tonal palette, organic shapes, spring physics, living-system hero)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Layout & Navigation](#layout--navigation)
- [Route Map](#route-map)
- [Design System](#design-system)
- [API & Data Layer](#api--data-layer)
- [Wallet & SEP-40 Auth](#wallet--sep-40-auth)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [E2E Testing](#e2e-testing)
- [Project Layout](#project-layout)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node.js)
- **VerdAnt Backend** running locally for API-backed routes

## Quick Start

```bash
# 1. Clone the repository
git clone git@github.com:VerdAnt-Chain/verdant-chain-frontend.git
cd verdant-frontend

# 2. Install dependencies
npm install

# 3. Start development server (HTTPS mode for Freighter)
npm run dev:https

# 4. Open in browser
open https://localhost:3000
```

The dev server proxies `/api/v1/*` to the backend (`VERDANT_BACKEND_URL`, default `http://localhost:8080`). Farmer and auth endpoints are live against the real backend; the four newer cores (proofs/equipment/projects/livestock) fall back to an in-memory demo store until their backend endpoints ship, so every workflow is explorable out of the box.

## Scripts

| Command                | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Development server (HTTP)                                          |
| `npm run dev:https`    | Development server with self-signed HTTPS (required for Freighter) |
| `npm run build`        | Production build (static HTML + SSG)                               |
| `npm run start`        | Serve production build                                             |
| `npm run lint`         | ESLint check                                                       |
| `npm run lint:fix`     | ESLint auto-fix                                                    |
| `npm run format`       | Prettier write                                                     |
| `npm run format:check` | Prettier check                                                     |
| `npm run typecheck`    | TypeScript check (`tsc --noEmit`)                                  |
| `npm test`             | Vitest (unit/component) run                                        |
| `npm run test:watch`   | Vitest watch mode                                                  |
| `npm run test:e2e`     | Playwright E2E (needs `npx playwright install`)                    |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js App Router (src/app/)                                │
│   page.tsx            → home / hero + pillar cards            │
│   discover/           → AgriScout search grid (API)           │
│   farmers/[address]/  → farmer profile (API)                  │
│   proofs/ (+create,[id])  → AgroProof explorer & workflow     │
│   equipment/ (+new,[id])  → AgriLease marketplace & leases    │
│   projects/ (+create,[id])→ FarmFund funding & milestones     │
│   livestock/ (+register,[id]) → LivestockPass provenance      │
│   verify|financing    → feature landing pages                 │
│   account|profile|settings → account shell (sidebar)          │
│   api/v1/**           → dev proxy/demo data layer             │
│   design-system/      → token + primitive showcase            │
└──────────────┬───────────────────────────────────────────────┘
               │  server components / RSC
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Client components (src/components/, src/app/**/Client.tsx)   │
│   ui/           → primitives (Button, Card, StatusPill, …)     │
│   core/         → EmptyState, Skeleton, FilterBar, Timeline,   │
│                   ProgressIndicator, EvidenceCard              │
│   wallet/       → WalletProvider, AuthButton (SEP-40 states)   │
│   sidebar/      → collapsible nav: Explore + Account groups    │
│   site-header/  → floating pill navigation                     │
│   hero/         → LivingSystem animated SVG                    │
│   sound/        → M3 expressive interaction clicks             │
│   feature-landing/ → shared landing surface                    │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Data layer (src/lib/)                                        │
│   api/         → fetch client + typed endpoints               │
│   wallet/      → Freighter connect + SEP-40 sign-in           │
│   theme-store  → theme persistence                            │
└──────────────┬───────────────────────────────────────────────┘
               │  HTTP (REST)  ────────────────►  verdant-backend
```

**Data flow.** Server components fetch/route; client components call the `src/lib/api` data layer, which talks to the backend REST API (contract in the coordination root's `docs/api/`). Wallet actions use `src/lib/wallet` and `src/lib/api/auth.ts`.

**Provider stack** (in `src/app/layout.tsx`):

1. `ClickSounds` — global M3-expressive interaction sounds (tap/select).
2. `WalletProvider` — Stellar wallet connection + SEP-40 session restore on mount.

## Layout & Navigation

### Site Header

Floating translucent pill (backdrop-blur) with:

- **Logo**: "V" wordmark + "VerdAnt" brand
- **Primary nav**: AgriScout · Verification · Equipment · Financing · Livestock · Design system
- **Actions**: Theme toggle (light/dark), wallet/auth button

### Sidebar

Collapsible floating card sidebar with two groups:

- **Home** — `/`
- **Explore** (collapsible):
  - AgriScout -> `/discover`
  - AgroProof -> `/proofs`
  - AgriLease -> `/equipment`
  - FarmFund -> `/projects`
  - LivestockPass -> `/livestock`
- **Account** (collapsible):
  - Overview -> `/account`
  - Profile -> `/profile`
  - Settings -> `/settings`

On mobile (<900px) the sidebar becomes a floating bottom pill bar.

Sidebar state persisted to `localStorage` (`verdant.sidebar.collapsed`, `verdant.sidebar.exploreOpen`, `verdant.sidebar.accountOpen`).

### Home Page (`/`)

The landing page features:

- **Hero section** with animated "LivingSystem" SVG (organic branching visualization)
- **Metrics strip**: Verified assets (12.4k), Farmers onboard (3.2k), Proof liveness (98.1%), User status
- **Five pillar cards**: AgriScout, AgroProof, AgriLease, FarmFund, LivestockPass
- **Footer**: "Foundation preview — the design system and shell."

## Route Map

### Product cores (functional workflows)

| Route                 | Purpose                                                                               | Data Source                                  |
| --------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `/proofs`             | **AgroProof** explorer: filter by status / subject / creator                          | `GET /api/v1/proofs`                         |
| `/proofs/create`      | Create a proof claim (draft)                                                          | `POST /api/v1/proofs`                        |
| `/proofs/[id]`        | Proof detail: evidence timeline, attach evidence, submit, verifier approve/reject     | `…/evidence` · `…/submit` · `…/verify`       |
| `/equipment`          | **AgriLease** marketplace: filter by type/availability, daily rates in XLM            | `GET /api/v1/equipment`                      |
| `/equipment/new`      | List equipment for lease                                                              | `POST /api/v1/equipment`                     |
| `/equipment/[id]`     | Equipment detail: request lease, owner approve, complete/cancel, lease history        | `GET/POST /api/v1/equipment/:id` · `/leases` |
| `/projects`           | **FarmFund** explorer: filter by category/status, funding progress bars               | `GET /api/v1/projects`                       |
| `/projects/create`    | Create a funding project (draft)                                                      | `POST /api/v1/projects`                      |
| `/projects/[id]`      | Project detail: fund contributions, publish, milestone submit/verify timeline         | `…/publish` · `…/fund` · `…/milestones/*`    |
| `/livestock`          | **LivestockPass** explorer: filter by species/status                                  | `GET /api/v1/livestock`                      |
| `/livestock/register` | Register an animal (species, breed, tag, microchip)                                   | `POST /api/v1/livestock`                     |
| `/livestock/[id]`     | Animal profile: provenance timeline, record health/movement events, transfer workflow | `…/history` · `…/events` · `…/transfer/*`    |

### Discovery & account

| Route                | Purpose                                                               | Data Source                    |
| -------------------- | --------------------------------------------------------------------- | ------------------------------ |
| `/`                  | Home: hero + LivingSystem animation, metrics strip, five pillar cards | static                         |
| `/discover`          | **AgriScout** discovery: search form, results grid, pagination        | `GET /api/v1/farmers` (AD-010) |
| `/farmers/[address]` | **AgriScout** farmer profile: metadata + verification markers         | `GET /api/v1/farmers/:address` |
| `/verify`            | **AgroProof** feature landing ("What is AgroProof?")                  | static demo data               |
| `/financing`         | **FarmFund** feature landing ("What is FarmFund?")                    | static demo data               |
| `/account`           | Account Overview: biodata card, verifications/profile/ledger stats    | `GET /api/v1/farmers/:address` |
| `/profile`           | Profile: farmer create/edit form (SEP-40 gated)                       | register / metadata endpoints  |
| `/settings`          | Settings: appearance, wallet, transaction password, danger zone       | local state                    |
| `/design-system`     | Design-system showcase: tokens + primitives                           | static                         |

### Data layer for the cores

All core routes talk to `src/lib/api/{proofs,equipment,projects,livestock}.ts`. In development
(`VERDANT_BACKEND_URL` set), requests hit route handlers under `src/app/api/v1/**` which proxy to
the real backend; if an upstream endpoint is not implemented yet (404), a clearly-scoped in-memory
demo store answers so every journey stays usable. Set `VERDANT_DISABLE_MOCK_FALLBACK=1` to force
pure proxy behaviour. No UI component imports mock data directly.

## Design System

See `src/styles/README.md` and the `/design-system` route for the full showcase.

### Tokens

CSS custom properties in `src/styles/tokens/` — color, typography, spacing, shape, elevation, motion, layout. Imported once via `tokens/index.css`.

### Primitives

`src/components/ui/`: `Button`, `Card`, `Container`, `Grid`, `Stack`, `Heading`, `Text`, `Input`, `Spinner`, `Badge`, `StatusPill`, `ThemeToggle`. Each has a CSS module + Vitest tests where behavior exists.

### StatusPill Marker Mapping

Verification marker kinds map to pill tones (yellow/green/blue/purple/teal/grey) via `--va-pill-tone-*` tokens.

### Styling Rules

- **No utility CSS**: all layout uses CSS Modules + tokens.
- **Dark mode**: first-class via `prefers-color-scheme` + `data-theme` override, persisted by the theme store.
- **Semantic tokens**: always use CSS custom properties, never hard-code colors.
- **M3 Expressive**: spring animations via `va-motion-expressive-default`, organic shapes via `va-shape-*` tokens.

## API & Data Layer

`src/lib/api/`:

- `client.ts` — base fetch client with `Authorization: Bearer` attachment and `setAuthToken`/`getAuthToken`/`loadAuthToken` (`localStorage` persistence, key `verdant.auth.token`).
- `types.ts` — shared API types for all domains (farmer, proof, equipment, lease, project, milestone, animal, transfer, auth payloads).
- Domain clients (typed, one per core):
  - `farmers.ts` — search, profile, register, metadata update
  - `proofs.ts` — list/get/create, evidence attach, submit, verifier verify
  - `equipment.ts` — equipment CRUD + lease lifecycle (`approve`/`complete`/`cancel`)
  - `projects.ts` — CRUD + publish + fund + milestone submit/verify
  - `livestock.ts` — register/update, event history, transfer accept/complete
- `format.ts` — `formatStroops()`: BigInt-only integer-safe stroops→XLM formatting (1 XLM = 10⁷ stroops; never floating-point for money).
- `list.ts` — `toListResponse()` normalizer (paginated envelope or bare array → stable `{ items, pagination }`) and query-builder.
- `auth.ts` — SEP-40 auth endpoints (`getAuthChallenge`, `verifyAuth`, `getAuthSession`).
- `config.ts` — API base URL configuration.

Canonical contracts live in the coordination root's `docs/api/` (`farmers.md`, `proofs.md`, `equipment.md`, `projects.md`, `livestock.md`).

## Wallet & SEP-40 Auth

`src/lib/wallet/`:

- `wallet.ts` — Freighter connect/snapshot logic, `getWalletSnapshot`, `WalletError`.
- `auth.ts` — **SEP-40 sign-in flow**:
  1. `connectWallet()` → Stellar `G…` address
  2. `POST /api/v1/auth/challenge { address }` → `{ domain, nonce, timestamp, address }`
  3. build SEP-40 message text (byte-identical to the backend `sep40_message`)
  4. sign with Freighter `signMessage(message)` (address already in message content)
  5. `POST /api/v1/auth/verify` → `{ token, address, roles, expires_at }`
  6. persist bearer token
  - `signOut()` clears the token.
- `auth.test.ts` — message builder + not-connected error + full sign-in happy path tests.

`WalletProvider` (in `src/components/wallet/wallet-provider.tsx`) loads the persisted token on app mount via `loadAuthSession()`. The `AuthButton` (in `src/components/wallet/auth-button.tsx`) displays connection state and handles sign-in/sign-out. The farmer register handler signs in before calling `registerFarmer`.

## Environment Variables

Next.js public variables must be prefixed with `NEXT_PUBLIC_` and are exposed to browser JavaScript. Secrets must never be stored in `NEXT_PUBLIC_` variables. See `.env.example`:

| Variable                          | Purpose                                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | Optional direct API base (leave unset for same-origin `/api/v1` via rewrites)                                                         |
| `NEXT_PUBLIC_SITE_URL`            | Canonical site URL for `metadataBase`, Open Graph/Twitter previews, `robots.txt`, `sitemap.xml` (defaults to `http://localhost:3000`) |
| `VERDANT_BACKEND_URL`             | Server-side only — proxy target for `/api/v1/:path*` rewrites and route-handler forwarding                                            |
| `VERDANT_DISABLE_MOCK_FALLBACK=1` | Server-side only — disable the demo-store fallback for cores whose backend endpoints are not implemented yet                          |

The `next.config.ts` rewrites use `VERDANT_BACKEND_URL` (server-side only) to proxy `/api/v1/:path*` → `${backendUrl}/api/v1/:path*` in development.

## Testing

```bash
npm test
```

Current suite: **109 tests passing** across 18 files, covering UI primitives, core workflow primitives (EmptyState/FilterBar), API clients for all five domains (URL/method/body/query assertions), the stroops formatter (including BigInt precision beyond `Number.MAX_SAFE_INTEGER`), list-response normalization, wallet store, and the SEP-40 sign-in flow.

## E2E Testing

```bash
npx playwright install
npm run test:e2e
```

Playwright specs live in `e2e/`.

## Project Layout

```
src/
├── app/                    # routes (App Router)
│   ├── page.tsx            #   home / hero + LivingSystem + pillar cards
│   ├── layout.tsx          #   root layout + providers + ClickSounds
│   ├── design-system/      #   design-system showcase
│   ├── discover/           #   AgriScout search (SearchDiscoveryClient)
│   ├── farmers/[address]/  #   farmer profile (FarmerProfileClient)
│   ├── proofs/             #   AgroProof: explorer + create + [id] workflow
│   ├── equipment/          #   AgriLease: marketplace + new + [id] leases
│   ├── projects/           #   FarmFund: explorer + create + [id] funding
│   ├── livestock/          #   LivestockPass: explorer + register + [id]
│   ├── verify/ financing/  #   feature landing pages
│   ├── account/            #   Account Overview (biodata + stats)
│   ├── profile/            #   Profile create/edit (SEP-40 gated)
│   ├── settings/           #   Settings (appearance, wallet, security)
│   └── api/v1/             #   dev data layer: backend proxy + demo store
├── components/
│   ├── ui/                 #   design-system primitives (+ tests)
│   ├── core/               #   workflow primitives (EmptyState, Skeleton,
│   │                       #   FilterBar, Timeline, ProgressIndicator, …)
│   ├── wallet/             #   WalletProvider, AuthButton
│   ├── sidebar/            #   collapsible nav (Explore + Account groups)
│   ├── site-header/        #   floating pill navigation
│   ├── hero/               #   LivingSystem animated SVG
│   ├── sound/              #   M3 expressive click sounds
│   └── theme/              #   theme script
├── styles/
│   ├── globals.css         #   base/reset + token import
│   └── tokens/             #   design tokens (CSS custom properties)
├── lib/
│   ├── api/                #   typed clients per domain + format/list utils
│   ├── ui/sound.ts         #   interaction sound engine
│   ├── wallet/             #   Freighter + SEP-40 auth
│   └── theme-store.ts      #   theme persistence
└── test/setup.ts           #   Vitest setup
e2e/                        #   Playwright specs
```

## Contributing

1. Fork the repo and create a branch from `main`.
2. Install deps and verify: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
3. Open a pull request.

## License

Apache License 2.0. See the `LICENSE` file.
