# 🗺️ Stashly Roadmap

Strategic product roadmap and milestone plans for Stashly — the modern, lightning-fast bookmark manager and knowledge organizer.

---

## 🎯 Vision

Create an effortless, secure, and privacy-focused bookmark & knowledge management system with instant sync, Telegram integration, automatic AI categorization, and cross-platform access.

---

## 📅 Milestones & Phases

### ✅ Phase 1: Core Foundation (Completed)
- [x] Full App Router Next.js 16 + React 19 architecture
- [x] Clerk authentication with session sync
- [x] SQLite & Cloudflare D1 unified repository layer
- [x] Rich metadata scraper with SSRF protection
- [x] Tag management, color coding, pinned tags
- [x] Dark / Light theme support
- [x] Netscape HTML, JSON, and CSV export & import
- [x] Serverless Telegram Bot integration with hashtag categorization

### 🚀 Phase 2: Skills Ecosystem Architecture Alignment (Current)
- [x] Feature-first domain encapsulation (`src/features/`)
- [x] Typed AppError hierarchy (`src/lib/errors.ts`)
- [x] Structured JSON logging with automated redaction (`src/lib/logger.ts`)
- [x] Centralized typed routes (`src/lib/routes.ts`) and validated environment (`src/lib/env.ts`)
- [x] Strict Security Headers (CSP, HSTS, X-Frame-Options, SSRF filters)
- [x] Complete REST API Documentation (`API.md`)
- [x] AI agent guidelines (`AGENTS.md`, `GEMINI.md`)

### 🔮 Phase 3: Enhanced Intelligence & Offline Support (Q4 2026)
- [ ] Local-first Offline mode with Service Worker & IndexedDB sync
- [ ] AI-powered automatic summary and content extraction
- [ ] Full-text search index across archived web page contents
- [ ] Browser extension for Chrome / Firefox / Safari 1-click saving

### 🌟 Phase 4: Team Workspaces & Collaboration (2027)
- [ ] Shared team collections and granular permission roles
- [ ] Public curated lists with custom subdomains
- [ ] Webhook triggers and Zapier / Make integrations
