# TanStack Documentation Reference

## ALWAYS check TanStack docs before fixing issues or adding features

This project uses the TanStack ecosystem. When in doubt about how something
works, consult the official documentation FIRST before guessing or improvising.

---

## Official Documentation URLs

| Library | Docs URL | Used for |
|---------|----------|---------|
| **TanStack Start** | https://tanstack.com/start/latest/docs/framework/react/overview | Full-stack framework, server functions, routing |
| **TanStack Router** | https://tanstack.com/router/latest/docs/framework/react/overview | File-based routing, type-safe navigation, search params |
| **TanStack Query** | https://tanstack.com/query/latest/docs/framework/react/overview | Server state, data fetching, caching |
| **TanStack Table** | https://tanstack.com/table/latest/docs/introduction | Door schedules, quotation tables |
| **TanStack Virtual** | https://tanstack.com/virtual/latest/docs/introduction | Virtualized lists/tables for large datasets |
| **TanStack Form** | https://tanstack.com/form/latest/docs/overview | Forms (door entry, quotation forms) |

---

## Key Patterns to Always Check

### Routing — check TanStack Router docs
- File-based routing: https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
- Type-safe navigation: https://tanstack.com/router/latest/docs/framework/react/guide/navigation
- Search params: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- Data loading: https://tanstack.com/router/latest/docs/framework/react/guide/data-loading

### Server Functions — check TanStack Start docs
- Server functions: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- API routes: https://tanstack.com/start/latest/docs/framework/react/guide/api-routes
- Middleware: https://tanstack.com/start/latest/docs/framework/react/guide/middleware
- Auth: https://tanstack.com/start/latest/docs/framework/react/guide/authentication

### Tables — check TanStack Table docs
- Getting started: https://tanstack.com/table/latest/docs/guide/tables
- Column definitions: https://tanstack.com/table/latest/docs/guide/column-defs
- Sorting: https://tanstack.com/table/latest/docs/guide/sorting
- Filtering: https://tanstack.com/table/latest/docs/guide/filtering
- Pagination: https://tanstack.com/table/latest/docs/guide/pagination
- Editable cells: https://tanstack.com/table/latest/docs/guide/cell-context

---

## Rules for AI Assistants

1. **Before adding any TanStack feature** — fetch and read the relevant docs page
2. **Before fixing a TanStack-related bug** — check if it's a known issue in the docs
3. **Never guess TanStack API shapes** — always verify against docs (APIs are type-safe but evolving)
4. **Check the version** — this project targets the `latest` tag for all TanStack libraries
5. **routeTree.gen.ts is auto-generated** — never manually edit it; run `npm run dev` to regenerate

---

## Common Gotchas (from docs)

- `tanstackStart()` plugin MUST come before `viteReact()` in vite.config.ts
- Do NOT enable `verbatimModuleSyntax` in tsconfig — causes server/client bundle leaks
- `routeTree.gen.ts` is generated on first `npm run dev` — it will not exist in a fresh clone until then
- Server functions (`createServerFn`) run on the server only — never put browser APIs in them
- TanStack Router is 100% type-safe — use `Link` and `useNavigate` with typed route paths, never raw strings
