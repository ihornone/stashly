# 📚 Stashly REST API Documentation

This document describes the API endpoints provided by Stashly for managing bookmarks, tags, Telegram integration, export/import, and public sharing.

---

## 🔐 Authentication

All private endpoints expect either:
1. **Session Cookie:** Active Clerk user session.
2. **API Key Header:** `Authorization: Bearer <token>` or `X-API-Key: <token>` for REST API v1.

---

## 📑 Endpoints Overview

### 1. Items (Bookmarks)

#### `GET /api/items`
Fetch user bookmarks with filtering and pagination.

**Query Parameters:**
- `tag` (string, optional) — Filter bookmarks by tag name.
- `search` (string, optional) — Search query matching title, URL, description, or notes.
- `type` (string, optional) — Filter by type (`link`, `article`, `video`, `image`, `document`, `post`, `audio`, `product`, `place`).
- `favorite` (boolean, optional) — Filter only starred/favorite items (`1` or `true`).
- `archived` (boolean, optional) — Filter only archived items (`1` or `true`).
- `broken` (boolean, optional) — Filter only broken link items (`1` or `true`).
- `duplicates` (boolean, optional) — Filter only duplicate items (`1` or `true`).
- `untagged` (boolean, optional) — Filter bookmarks with zero tags (`1` or `true`).
- `sort` (string, optional) — Sort order (`created_at_desc`, `created_at_asc`, `title_asc`, `title_desc`, `clicks_desc`).
- `page` (number, optional, default: `1`) — Page number.
- `limit` (number, optional, default: `30`, max: `100`) — Page size.

**Response `200 OK`:**
```json
{
  "items": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Domain",
      "description": "Example description",
      "image": "https://example.com/og.jpg",
      "favicon": "https://example.com/favicon.ico",
      "item_type": "link",
      "is_favorite": 0,
      "is_archived": 0,
      "is_broken": 0,
      "tags": ["tech", "reference"],
      "created_at": "2026-10-04T12:00:00.000Z",
      "updated_at": "2026-10-04T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 30,
  "totalPages": 1
}
```

#### `POST /api/items`
Create a new bookmark.

**Request Body:**
```json
{
  "url": "https://github.com/facebook/react",
  "title": "React Repository",
  "description": "The library for web and native user interfaces.",
  "image": "https://github.com/og.png",
  "favicon": "https://github.com/favicon.ico",
  "item_type": "link",
  "notes": "My notes about React 19",
  "tags": ["react", "frontend", "github"]
}
```

**Response `201 Created`:**
```json
{
  "id": 42,
  "message": "Item created successfully"
}
```

#### `DELETE /api/items/delete`
Delete one or multiple bookmarks.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

---

### 2. Tags

#### `GET /api/tags`
Retrieve all tags owned by the current user with bookmark counts and color codes.

**Response `200 OK`:**
```json
[
  {
    "name": "react",
    "color": "#3b82f6",
    "count": 14,
    "is_pinned": 1
  }
]
```

#### `POST /api/tags/update-color`
Update a tag's highlight color.

**Request Body:**
```json
{
  "tag": "react",
  "color": "#06b6d4"
}
```

---

### 3. Telegram Bot Integration

#### `POST /api/telegram/webhook`
Webhook receiver for Telegram bot updates (incoming messages, deep-link `/start`, commands).

**Headers:**
- `X-Telegram-Bot-Api-Secret-Token`: Optional secret configured in `TELEGRAM_WEBHOOK_SECRET`.

---

### 4. Metadata Extraction (Scraper)

#### `POST /api/items/fetch-metadata`
Extract OpenGraph title, description, image, and favicon from any URL with built-in SSRF protection.

**Request Body:**
```json
{
  "url": "https://news.ycombinator.com"
}
```

**Response `200 OK`:**
```json
{
  "title": "Hacker News",
  "description": "Social news website focusing on computer science and entrepreneurship.",
  "image": "https://news.ycombinator.com/favicon.ico",
  "favicon": "https://news.ycombinator.com/favicon.ico",
  "item_type": "link"
}
```

---

### 5. Export & Import

- `GET /api/export?format=html` — Export bookmarks in Netscape Bookmark HTML format.
- `GET /api/export?format=json` — Export bookmarks in JSON format.
- `GET /api/export?format=csv` — Export bookmarks in CSV format.
- `POST /api/import/bookmarks` — Import HTML/JSON/CSV bookmarks with deduplication.

---

## ⚠️ Error Responses

All error responses adhere to the standard schema:
```json
{
  "error": "Error description",
  "code": "VALIDATION_ERROR | NOT_FOUND | AUTHENTICATION_ERROR | RATE_LIMIT_EXCEEDED | INTERNAL_SERVER_ERROR",
  "userMessage": "Human-friendly explanation for user UI display."
}
```
