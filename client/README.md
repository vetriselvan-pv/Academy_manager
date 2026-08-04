# Viva Academy — Client

React 19 + TypeScript SPA for Viva Academy, serving three experiences behind one login: a Super
Admin console, a Teacher console, and a Student portal. Talks to the Fastify API in [`../server`](../server).

## Stack

| Concern | Choice |
| --- | --- |
| Build tool | [Vite](https://vite.dev/) |
| Language | TypeScript (strict mode) |
| Routing | [react-router-dom](https://reactrouter.com/) v7 |
| Server state | [TanStack Query](https://tanstack.com/query) |
| Forms & validation | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| HTTP client | [axios](https://axios-http.com/), with an interceptor that refreshes the access token on 401 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons / toasts | [lucide-react](https://lucide.dev/) / [sonner](https://sonner.emilkowal.ski/) |
| Linting | [oxlint](https://oxc.rs/) |

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL — defaults to /api, proxied to the server in dev
npm run dev             # http://localhost:5173, proxies /api to http://localhost:4000
```

The dev server proxies `/api/*` to the backend (see `vite.config.ts`), so make sure
[`../server`](../server) is running (`npm run dev` there) with MongoDB available.

Other scripts: `npm run build` (type-check + production build to `dist/`), `npm run preview`
(serve the production build locally), `npm run lint` (oxlint).

## Folder structure

```
src/
  api/          one file per backend resource (auth, me, branches, courses, teachers,
                students, enrollments, menus) — thin wrappers around the shared apiClient
  auth/         AuthContext (session state, login/logout/register) + permission helpers
  components/
    ui/         design-system primitives (Button, Input, Select, MultiSelect, DataTable,
                Modal, ConfirmDialog, Badge, Card, ...) — reused by every feature
    layout/     AppLayout, Sidebar (renders GET /api/menus), Topbar
  features/     one folder per screen/resource (dashboard, courses, branches, teachers,
                students, enrollments, profile, settings, reports) — each holds its
                use<Resource>.ts query/mutation hooks, *FormModal.tsx, and *Page.tsx
  lib/          apiClient (axios + token refresh), queryClient, tokenStorage, authEvents, utils
  routes/       AppRoutes (route tree), ProtectedRoute/GuestRoute, RequireAccess (role/permission gate)
  types/        enums.ts and models.ts mirroring the server's types, api.ts response envelopes
```

## Access control

Navigation is driven entirely by `GET /api/menus`, filtered server-side for the logged-in
user's role/permissions — the Sidebar just renders whatever tree comes back. Route-level access
is additionally enforced client-side via `RequireAccess` (role/permission checks mirroring the
server's `authorize`/`can` guards), and in-page actions (edit/deactivate buttons, etc.) are gated
per-screen using `useAuth()` + the helpers in `src/auth/permissions.ts`. All of this is
defense-in-depth for UX only — the server is the source of truth and re-checks everything itself.
