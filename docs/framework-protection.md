# Framework and Architecture Protection

## Official Tech Stack — DO NOT CHANGE

```
Frontend:  TanStack Start (powered by Vite + TanStack Router)
Styling:   Tailwind CSS + Design Tokens (from Figma pipeline)
Backend:   NestJS (TypeScript) — in /backend
Database:  PostgreSQL
```

TanStack Start is the deliberate, final choice for this project.
It was chosen because:
- Built on Vite (instant dev server, fast HMR)
- Full-stack capability (server functions, API routes) without a separate framework
- End-to-end TypeScript type safety
- TanStack ecosystem (Table, Query, Router) for heavy table usage
- Internal tool — no SSR/SEO requirement, SPA mode available

---

## ❌ NEVER do these without explicit user approval:

1. **Do NOT migrate to Next.js, Remix, plain Vite SPA, or any other framework**
2. **Do NOT replace TanStack Router with React Router, Wouter, or others**
3. **Do NOT change the build tool** (Vite is underneath TanStack Start — keep it)
4. **Do NOT add a second state management library** (ask first)
5. **Do NOT restructure the routes/ folder structure** (TanStack Start file-based routing)
6. **Do NOT add GraphQL** unless explicitly requested
7. **Do NOT change the NestJS backend** to Express, Fastify, etc. without approval

---

## ✅ Always ask before:

- Migrating any framework or build tool
- Adding packages > 50KB (check bundle impact first)
- Adding a new global provider or context
- Changing the design token pipeline

---

## Stack Decision History

| Decision | Reason |
|----------|--------|
| Removed Next.js | SSR/App Router overkill for internal tool |
| Removed plain Vite SPA | TanStack Start gives same Vite speed + full-stack capability |
| Chose TanStack Start | Vite-powered, type-safe server functions, TanStack ecosystem |
