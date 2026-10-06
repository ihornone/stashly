# 🤖 AI Agent Guidelines & Architecture for Stashly

Welcome to **Stashly**, a production-grade bookmark manager and knowledge-saving platform built on Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MobX, and SQLite/Cloudflare D1.

This project strictly follows the **Skills Ecosystem Rules** located in [`/rules`](./rules).

---

## 🏛️ Architecture & Layering

The codebase follows the strict dependency direction:
```
app → features → shared/lib/components → external libraries
```

1. **`src/app/`**: Next.js App Router (pages, layouts, route handlers, error boundaries).
2. **`src/features/`**: Self-contained domain features (`bookmarks`, `tags`, `landing`, `docs`). Each feature exports its public API through `index.ts`.
3. **`src/components/ui/`**: Reusable headless and styled UI primitives (Radix UI, Base UI, Lucide icons).
4. **`src/lib/`**: Shared utilities, typed error hierarchy (`errors.ts`), structured logger (`logger.ts`), validated env (`env.ts`), and route constants (`routes.ts`).
5. **`src/server/`**: Server-side business logic, repositories (`ItemRepository`, `TagRepository`, `TelegramRepository`), DB adapters, scraper, and Telegram Bot client.
6. **`src/store/`**: Reactive client-side global state managed via MobX.

---

## 📜 Mandatory Rules Checklist

When adding or modifying code, verify compliance against the relevant skill rules:

### 1. Web Architecture (`rules/web-project-structure`)
- Features must be isolated in `src/features/<feature>/` with a public `index.ts`.
- No cross-feature internal imports — communicate through shared interfaces or public exports.
- Use typed route constants from `@/lib/routes` instead of hardcoded strings.
- Validate environment variables with `@/lib/env`.

### 2. UI & Components (`rules/web-components-patterns`)
- Semantic HTML first, ARIA second.
- Extract props to TypeScript interfaces.
- Separate Server Components (default) from Client Components (`'use client'`).
- Feature zones must be protected with Error Boundaries.

### 3. Error Handling (`rules/error-handling-standards`)
- Use the typed error classes from `@/lib/errors` (`ValidationError`, `AuthenticationError`, `NotFoundError`, etc.).
- Never swallow errors silently in `catch` blocks.
- Return structured error responses from API route handlers using `handleApiError()`.

### 4. Logging (`rules/logging-standards`)
- Use `@/lib/logger` for structured JSON logs.
- Never log secrets, passwords, Bearer tokens, or full cookie strings (`logger` automatically redacts known sensitive keys).

### 5. Security (`rules/web-security` & `rules/security-checklist`)
- Scraper must validate all URLs with `isPublicIp` / SSRF protection before fetching.
- Parameterized queries must be used for all database access.
- Security headers are configured in `next.config.ts`.
- Validate all incoming request payloads with Zod schemas.

### 6. Asynchronous Operations (`rules/async-patterns-universal`)
- External network requests (scrapers, Telegram API) must use explicit timeouts (`AbortSignal.timeout(ms)`).
- Perform independent async operations concurrently with `Promise.all()`.
- Always release resources in `finally` blocks.

---

## 🛠️ Common Commands

- **Development Server:** `npm run dev`
- **Production Webpack Build:** `npm run build`
- **Cloudflare Build:** `npm run cloudflare:build`
