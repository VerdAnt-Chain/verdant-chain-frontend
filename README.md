# VerdAnt Frontend

**The user-facing application for the VerdAnt ecosystem — open agricultural technology & financial infrastructure built on Stellar/Soroban.**

VerdAnt is a full-stack ecosystem that anchors farm identity, verification, equipment leasing, financing, and livestock provenance on Stellar/Soroban while keeping documents and media off-chain. This repository delivers the design system, the AgriScout discovery + farmer profile surfaces, four feature landing pages (AgroProof, AgriLease, FarmFund, LivestockPass), and the SEP-40 Freighter wallet-connect flow against the VerdAnt backend.

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

For API-backed routes (`/discover`, `/farmers/[address]`), the backend must be running on `http://localhost:8080` and `src/lib/api/config.ts` must point at it.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (HTTP) |
| `npm run dev:https` | Development server with self-signed HTTPS (required for Freighter) |
| `npm run build` | Production build (static HTML + SSG) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Vitest (unit/component) run |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E (needs `npx playwright install`) |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js App Router (src/app/)                                │
│   page.tsx            → home / hero + pillar cards            │
│   discover/           → AgriScout search grid (API)           │
│   farmers/[address]/  → farmer profile (API)                  │
│   verify|equipment|financing|livestock → feature landings     │
│   account|profile|settings → account shell (sidebar)          │
│   design-system/      → token + primitive showcase            │
└──────────────┬───────────────────────────────────────────────┘
               │  server components / RSC
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Client components (src/components/, src/app/**/Client.tsx)   │
│   ui/           → primitives (Button, Card, StatusPill, …)     │
│   feature-landing/ → shared landing surface                    │
│   wallet/       → WalletProvider, WalletButton, AuthButton     │
│   sidebar/      → collapsible sidebar with Account group       │
│   site-header/  → top navigation bar                           │
│   hero/         → LivingSystem animated SVG                    │
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

1. `PreferencesProvider` (outermost) — locale/currency preferences.
2. `ToastProvider` — global notification system.
3. `WalletProvider` (innermost) — Stellar wallet connections, session restore on mount.

## Layout & Navigation

### Site Header

Fixed top bar with:
- **Logo**: "V" wordmark + "VerdAnt" brand
- **Primary nav**: AgriScout, Verification, Equipment, Financing, Livestock, Design system
- **Actions**: Theme toggle (light/dark), Connect Freighter button

### Sidebar

Collapsible left sidebar with:
- **Home** — links to `/`
- **Discover** — links to `/discover` (AgriScout search)
- **Account** group (collapsible):
  - Overview — `/account`
  - Profile — `/profile`
  - Settings — `/settings`

Sidebar state persisted to `localStorage` (`verdant.sidebar.collapsed`, `verdant.sidebar.accountOpen`).

### Home Page (`/`)

The landing page features:
- **Hero section** with animated "LivingSystem" SVG (organic branching visualization)
- **Metrics strip**: Verified assets (12.4k), Farmers onboard (3.2k), Proof liveness (98.1%), User status
- **Five pillar cards**: AgriScout, AgroProof, AgriLease, FarmFund, LivestockPass
- **Footer**: "Foundation preview — the design system and shell."

## Route Map

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/` | Home: hero + LivingSystem animation, metrics strip, five pillar cards | static |
| `/discover` | **AgriScout** discovery: search form, results grid, pagination | `GET /api/v1/farmers` (AD-010) |
| `/farmers/[address]` | **AgriScout** farmer profile: metadata + verification markers | `GET /api/v1/farmers/:address` |
| `/verify` | **AgroProof** feature landing: harvest batch, soil report, invoice | static demo data |
| `/equipment` | **AgriLease** feature landing: tractor, harvester, irrigation | static demo data |
| `/financing` | **FarmFund** feature landing: milestones (land prep, planting, harvest) | static demo data |
| `/livestock` | **LivestockPass** feature landing: cow, goat records | static demo data |
| `/account` | Account Overview: wallet connection status, address display | wallet state |
| `/profile` | Profile: farmer registration form (auth-gated) | `POST /api/v1/farmers/register` |
| `/settings` | Settings: appearance theme, wallet management, danger zone | local state |
| `/design-system` | Design-system showcase: tokens + primitives | static |

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
- `types.ts` — shared API types (`FarmerRecord`, `FarmerSearchResponse`, `AuthChallenge`, `AuthVerifyPayload`, `AuthVerifyResponse`, …).
- `farmers.ts` — farmer endpoints (search, profile, register, update).
- `auth.ts` — SEP-40 auth endpoints (`getAuthChallenge`, `verifyAuth`, `getAuthSession`).
- `config.ts` — API base URL configuration (`NEXT_PUBLIC_API_BASE_URL` → `/api/v1` via `next.config.ts` rewrites).
- `address.ts` — Stellar address validation helpers.

API contracts (canonical): the coordination root's `docs/api/farmers.md`.

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

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for `metadataBase`, Open Graph/Twitter previews, `robots.txt`, `sitemap.xml` (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_WALLET_RPC_URL` | Reserved — public JSON-RPC endpoint |
| `NEXT_PUBLIC_WALLET_CONNECT_RELAY` | Reserved — WalletConnect relay URL |

The `next.config.ts` rewrites use `VERDANT_BACKEND_URL` (server-side only) to proxy `/api/v1/:path*` → `${backendUrl}/api/v1/:path*` in development.

## Testing

```bash
npm test
```

Current suite: **51 tests passing** across 11 files, covering UI primitives (Button, Container, Grid, Heading, Input, Stack, StatusPill, ThemeToggle), API client + address helpers, wallet store, and the SEP-40 sign-in flow.

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
│   ├── layout.tsx          #   root layout + providers
│   ├── design-system/      #   design-system showcase
│   ├── discover/           #   AgriScout search (SearchDiscoveryClient)
│   ├── farmers/[address]/  #   farmer profile (FarmerProfileClient)
│   ├── verify/             #   AgroProof landing
│   ├── equipment/          #   AgriLease landing
│   ├── financing/          #   FarmFund landing
│   ├── livestock/          #   LivestockPass landing
│   ├── account/            #   Account Overview (auth-gated)
│   ├── profile/            #   Profile create/edit (auth-gated)
│   └── settings/           #   Settings (appearance, wallet, danger zone)
├── components/
│   ├── ui/                 #   design-system primitives (+ tests)
│   ├── feature-landing/    #   shared feature landing component
│   ├── wallet/             #   WalletProvider, WalletButton, AuthButton
│   ├── sidebar/            #   collapsible sidebar with Account group
│   ├── site-header/        #   top navigation bar
│   ├── hero/               #   LivingSystem animated SVG
│   └── theme/              #   theme script
├── styles/
│   ├── globals.css         #   base/reset + token import
│   └── tokens/             #   design tokens (CSS custom properties)
├── lib/
│   ├── api/                #   data layer (client, types, endpoints)
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
