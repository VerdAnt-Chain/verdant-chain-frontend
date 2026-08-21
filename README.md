# VerdAnt Frontend

**The user-facing application for the VerdAnt ecosystem — open agricultural
technology & financial infrastructure built on Stellar/Soroban.**

This repository delivers the design system, the AgriScout discovery + farmer
profile surfaces, four feature landing pages (AgroProof, AgriLease, FarmFund,
LivestockPass), and the SEP-40 Freighter wallet-connect flow against the
VerdAnt backend.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. For API-backed routes (`/discover`,
`/farmers/[address]`), the backend must be running and `src/lib/api/config.ts`
must point at it.

## Scripts

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Development server                              |
| `npm run build`        | Production build                                |
| `npm run start`        | Serve production build                          |
| `npm run lint`         | ESLint check                                    |
| `npm run lint:fix`     | ESLint fix                                      |
| `npm run format`       | Prettier write                                  |
| `npm run format:check` | Prettier check                                  |
| `npm run typecheck`    | TypeScript check (`tsc --noEmit`)               |
| `npm test`             | Vitest (unit/component) run                     |
| `npm run test:watch`   | Vitest watch mode                               |
| `npm run test:e2e`     | Playwright E2E (needs `npx playwright install`) |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js App Router (src/app/)                                │
│   page.tsx            → home / pillar cards                   │
│   discover/           → AgriScout search grid (API)           │
│   farmers/[address]/  → farmer profile (API)                  │
│   verify|equipment|financing|livestock → feature landings     │
│   design-system/      → token + primitive showcase            │
└──────────────┬───────────────────────────────────────────────┘
               │  server components / RSC
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Client components (src/components/, src/app/**/Client.tsx)   │
│   ui/           → primitives (Button, Card, StatusPill, …)     │
│   feature-landing/ → shared landing surface                    │
│   wallet/       → WalletProvider, WalletButton                 │
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

**Data flow.** Server components fetch/route; client components call the
`src/lib/api` data layer, which talks to the backend REST API (contract in the
coordination root's `docs/api/`). Wallet actions use `src/lib/wallet` and
`src/lib/api/auth.ts`.

**Provider stack** (in `src/app/layout.tsx`):

1. `PreferencesProvider` (outermost) — locale/currency preferences.
2. `ToastProvider` — global notification system.
3. `WalletProvider` (innermost) — Stellar wallet connections.

## Route map

| Route                | Purpose                                                        | Data source                    |
| -------------------- | -------------------------------------------------------------- | ------------------------------ |
| `/`                  | Home: hero + five pillar cards linking to surfaces             | static                         |
| `/discover`          | **AgriScout** discovery: search form, results grid, pagination | `GET /api/v1/farmers` (AD-010) |
| `/farmers/[address]` | **AgriScout** farmer profile: metadata + verification markers  | `GET /api/v1/farmers/:address` |
| `/verify`            | **AgroProof** feature landing (verification along the chain)   | static demo data               |
| `/equipment`         | **AgriLease** feature landing (escrowed equipment bookings)    | static demo data               |
| `/financing`         | **FarmFund** feature landing (milestone financing)             | static demo data               |
| `/livestock`         | **LivestockPass** feature landing (livestock identity/history) | static demo data               |
| `/design-system`     | Design-system showcase (tokens + primitives)                   | static                         |

## Design system & styling

See `src/styles/README.md` and the `/design-system` route for the full showcase.

- **Tokens**: CSS custom properties in `src/styles/tokens/` — color, typography,
  spacing, shape, elevation, motion, layout. Imported once via `tokens/index.css`.
- **Primitives** (`src/components/ui/`): `Button`, `Card`, `Container`, `Grid`,
  `Stack`, `Heading`, `Text`, `Input`, `Spinner`, `Badge`, `StatusPill`,
  `ThemeToggle`. Each has a CSS module + Vitest tests where behavior exists.
- **StatusPill marker mapping**: verification marker kinds map to pill tones
  (yellow/green/blue/purple/teal/grey) via `--va-pill-tone-*` tokens.
- **No utility CSS**: all layout uses CSS Modules + tokens.
- **Dark mode**: first-class via `prefers-color-scheme` + `data-theme`
  override, persisted by the theme store.

## API & data layer

`src/lib/api/`:

- `client.ts` — base fetch client with `Authorization: Bearer` attachment and
  `setAuthToken`/`getAuthToken`/`loadAuthToken` (`localStorage` persistence,
  key `verdant.auth.token`).
- `types.ts` — shared API types (`FarmerRecord`, `FarmerSearchResponse`,
  `AuthChallenge`, `AuthVerifyPayload`, `AuthVerifyResponse`, …).
- `farmers.ts` — farmer endpoints (search, profile, register, update).
- `auth.ts` — SEP-40 auth endpoints (`getAuthChallenge`, `verifyAuth`,
  `getAuthSession`).
- `config.ts` — API base URL configuration.
- `address.ts` — Stellar address validation helpers.

API contracts (canonical): the coordination root's `docs/api/farmers.md`.

## Wallet & SEP-40 auth

`src/lib/wallet/`:

- `wallet.ts` — Freighter connect/snapshot logic, `getWalletSnapshot`,
  `WalletError`.
- `auth.ts` — **SEP-40 sign-in flow**:
  1. `connectWallet()` → Stellar `G…` address
  2. `POST /api/v1/auth/challenge { address }` → `{ domain, nonce, timestamp, address }`
  3. build SEP-40 message text (byte-identical to the backend `sep40_message`)
  4. sign with Freighter `signMessage`
  5. `POST /api/v1/auth/verify` → `{ token, address, roles, expires_at }`
  6. persist bearer token
  - `signOut()` clears the token.
- `auth.test.ts` — message builder + not-connected error + full sign-in happy
  path tests.

`WalletProvider` (in `src/components/wallet/wallet-provider.tsx`) loads the
persisted token on app mount. The farmer register handler signs in before
calling `registerFarmer`.

## Environment variables

Next.js public variables must be prefixed with `NEXT_PUBLIC_` and are exposed
to browser JavaScript. Secrets must never be stored in `NEXT_PUBLIC_`
variables. See `.env.example`:

| Variable                           | Purpose                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | Canonical site URL for `metadataBase`, Open Graph/Twitter previews, `robots.txt`, `sitemap.xml` (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_WALLET_RPC_URL`       | Reserved — public JSON-RPC endpoint                                                                                                   |
| `NEXT_PUBLIC_WALLET_CONNECT_RELAY` | Reserved — WalletConnect relay URL                                                                                                    |

## Tests

```bash
npm test
```

Current suite: **55 tests passing** across 12 files, covering UI primitives
(Button, Container, Grid, Heading, Input, Stack, StatusPill, ThemeToggle), API
client + address helpers, wallet store, and the SEP-40 sign-in flow.

## E2E

```bash
npx playwright install
npm run test:e2e
```

Playwright specs live in `e2e/`.

## Definition of Done

- Meets documented interface contracts.
- Includes tests; passes lint, format, typecheck, and the production build
  (8 prerendered routes).
- No secrets committed; reuses shared primitives.
- Committed as small conventional changes.

CI is not yet configured for this repository; run the quality gates locally
before pushing.

## Project layout

```
src/
├── app/                    # routes (App Router)
│   ├── page.tsx            #   home / pillar cards
│   ├── layout.tsx          #   root layout + providers
│   ├── design-system/      #   design-system showcase
│   ├── discover/           #   AgriScout search (SearchDiscoveryClient)
│   ├── farmers/[address]/  #   farmer profile (FarmerProfileClient)
│   ├── verify/             #   AgroProof landing
│   ├── equipment/          #   AgriLease landing
│   ├── financing/          #   FarmFund landing
│   └── livestock/          #   LivestockPass landing
├── components/
│   ├── ui/                 #   design-system primitives (+ tests)
│   ├── feature-landing/    #   shared feature landing component
│   ├── wallet/             #   WalletProvider, WalletButton
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
2. Install deps and verify: `npm run typecheck`, `npm run lint`, `npm test`,
   `npm run build`.
3. Open a pull request.

## License

Apache License 2.0. See the `LICENSE` file.
