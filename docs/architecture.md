# Project Architecture — Doorwise

## Stack

```
TanStack Start (Vite + TanStack Router) — frontend + server functions
NestJS                                  — dedicated backend API
PostgreSQL                              — database
Tailwind CSS + Design Tokens            — styling
```

---

## File Structure

```
src/
├── routes/              # TanStack Start file-based routes
│   ├── __root.tsx       # Root layout (HTML shell, global CSS)
│   ├── index.tsx        # Redirect / → /home
│   ├── home.tsx         # Main app (PDF + door schedule)
│   └── ui-kit.tsx       # Component showcase
├── pages/               # Route-level React components
│   ├── Home.tsx
│   └── UIKit.tsx
├── components/
│   ├── ui/              # Design system primitives
│   │   ├── Button.tsx
│   │   ├── index.ts     # Barrel export
│   │   └── ...
│   └── [Feature].tsx    # Feature components (PDFViewer, etc.)
├── hooks/               # Custom React hooks (useTheme, useDoors, etc.)
├── services/            # Business logic (PDF parsing, API calls)
├── styles/
│   └── design-tokens.css  # Generated CSS variables (npm run build:tokens)
├── types/               # Shared TypeScript types
├── utils/               # Pure helper functions
└── router.tsx           # TanStack Router configuration
```

---

## Routing (TanStack Router)

- Routes live in `src/routes/` — file name = URL path
- `__root.tsx` wraps all routes (global providers, CSS)
- Use `createFileRoute` for every route file
- Use `createServerFn` for server-side data fetching
- `routeTree.gen.ts` is auto-generated on `npm run dev` — commit it

```tsx
// Pattern for a new route
export const Route = createFileRoute('/my-page')({
  component: MyPage,
  // Optional: loader for server data
  loader: async () => await getMyData(),
})
```

---

## Server Functions

Use `createServerFn` for data that must come from the server (DB, secrets).
This is TanStack Start's type-safe RPC — prefer this over REST for internal data.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getDoors = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await db.doors.findMany()
  })
```

---

## Design System Rules

- **Never hardcode colors or spacing** — use Tailwind classes from tokens
- Source tokens: `design-system/figma-export/`
- Regenerate after Figma export: `npm run build:tokens`
- Generated outputs: `design-tokens.css`, `designTokens.ts`, `tailwind-theme.json`

---

## Component Guidelines

- `src/components/ui/` — framework-agnostic, reusable primitives only
- `src/components/` — feature components (PDFViewer, DoorScheduleTable)
- Always export TypeScript types alongside components
- `src/components/ui/index.ts` is the single barrel export

---

## State Management

- **Local state**: `useState` / `useReducer`
- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **URL state**: TanStack Router search params
- **Global UI**: React Context or Zustand (ask first before adding)

Keep state as local as possible.
