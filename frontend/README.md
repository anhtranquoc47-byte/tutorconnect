# React Base

Production-ready React starter: **React 19 + Vite**, TypeScript (strict),
Tailwind CSS v4, React Router, **Zustand** (client state) + **TanStack Query**
(server state), Axios with interceptors, i18next, and Vitest.

> Part of the [Base Solution](../README.md) set. Angular and Vue siblings share
> the same architecture.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Sign in with **`demo@example.com` / `password`** → open **Users**.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run typecheck` | Type-check without emitting |
| `npm test` / `test:watch` / `test:coverage` | Vitest |

## Architecture

State is split by **ownership**:

- **Server state** (users, anything fetched) → **TanStack Query**. Caching,
  refetching, retries, and invalidation live here. See `features/users/users.queries.ts`.
- **Client/UI state** (auth session, dialogs, filters) → **Zustand** or local
  component state. See `features/auth/auth.store.ts`.

This separation is the single most important convention: **don't put server
data in Zustand, and don't put UI state in Query.**

### Folder structure

```
src/
├── app/                  # App-wide wiring
│   ├── providers.tsx     # StrictMode + Query + i18n providers
│   ├── query-client.ts   # TanStack Query defaults (retry, staleTime)
│   └── router.tsx        # Route table with lazy() code splitting
├── config/
│   └── env.ts            # Typed access to import.meta.env (single source)
├── lib/
│   ├── api/
│   │   ├── http.ts       # Axios instance + interceptors + ApiError
│   │   └── token-storage.ts
│   └── i18n/             # i18next init + en/vi locales
├── components/
│   ├── ui/               # Button, Input, Card, Spinner (design-token based)
│   └── layout/           # AppLayout (nav, language switch, logout)
├── features/             # Feature-first modules
│   ├── auth/             # store, api (mock), guard, LoginPage, types
│   └── users/            # api, queries, types, list page, form dialog
├── pages/                # Cross-feature pages (Home, NotFound)
├── hooks/                # Reusable hooks (useDebounce)
├── test/                 # Vitest setup
└── main.tsx              # Entry: providers + RouterProvider
```

### Path alias

`@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Import
`@/features/users/...` rather than long relative paths.

### HTTP layer (`lib/api/http.ts`)

- **Request interceptor** attaches `Authorization: Bearer <token>`.
- **Response interceptor** performs a **single, deduplicated** token refresh on
  `401`, replays the original request, and on failure dispatches an
  `auth:logout` event the auth store listens for.
- Every error becomes an **`ApiError`** (`status`, `code`, `fieldErrors`) — UI
  and queries branch on this, never on raw Axios errors.

### Auth & route guard

`ProtectedRoute` (`features/auth/ProtectedRoute.tsx`) wraps private routes; it
redirects unauthenticated users to `/login` and restores the intended URL after
login. The mock lives in `features/auth/auth.api.ts` — replace it with a real
`http.post('/auth/login')` call (the comment shows exactly how).

## How to add a feature

Example: a **Products** feature.

1. `src/features/products/products.types.ts` — `Product`, `CreateProductInput`.
2. `products.api.ts` — thin Axios calls using `@/lib/api/http`.
3. `products.queries.ts` — `useProducts`, `useCreateProduct`, … with a
   `productKeys` factory (copy the shape from `users.queries.ts`).
4. `ProductsListPage.tsx` — the UI, using `@/components/ui/*`.
5. Register a lazy route in `src/app/router.tsx` under the protected layout.
6. Add nav link in `components/layout/AppLayout.tsx` and i18n keys in
   `lib/i18n/locales/*.json`.
7. Add a test next to the component (`*.test.tsx`).

## Testing

Vitest + Testing Library, jsdom environment, setup in `src/test/setup.ts`.
Example: `src/components/ui/Button.test.tsx`. Run `npm test`.

## Configuration

Copy `.env.example` → `.env`. Client-exposed vars must be prefixed `VITE_`:

| Var | Meaning |
|---|---|
| `VITE_APP_NAME` | Display name |
| `VITE_API_BASE_URL` | Backend base URL (defaults to a public mock) |
| `VITE_DEFAULT_LOCALE` | Fallback language |
| `VITE_ENABLE_MOCK` | Reserved flag for mock toggles |

`.env.production` sets `VITE_API_BASE_URL=/api` for reverse-proxy deployment.

## Docker

```bash
docker build -t react-base .
docker run -p 8080:80 react-base
```

Multi-stage build (Node → nginx). `nginx.conf` has SPA fallback + asset caching.
