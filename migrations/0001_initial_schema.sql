-- Stashly Production Schema for Cloudflare D1

CREATE TABLE IF NOT EXISTS items (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  comments TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TEXT DEFAULT(NULL),
  updated_at TEXT DEFAULT(NULL),
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  is_broken INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'link',
  favicon TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  parent INTEGER NOT NULL DEFAULT 0,
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT(NULL),
  updated_at TEXT DEFAULT(NULL)
);

CREATE TABLE IF NOT EXISTS items_tags (
  item_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  dark_theme TEXT NOT NULL DEFAULT 'dark',
  light_theme TEXT NOT NULL DEFAULT 'light',
  density TEXT NOT NULL DEFAULT 'comfortable',
  columns INTEGER NOT NULL DEFAULT 3,
  display_view TEXT NOT NULL DEFAULT 'grid',
  sort_by TEXT NOT NULL DEFAULT 'created_at',
  sort_order TEXT NOT NULL DEFAULT 'desc',
  group_by TEXT NOT NULL DEFAULT 'none',
  show_images INTEGER NOT NULL DEFAULT 1,
  show_descriptions INTEGER NOT NULL DEFAULT 1,
  show_tags INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT(NULL),
  updated_at TEXT DEFAULT(NULL)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT DEFAULT(NULL),
  updated_at TEXT DEFAULT(NULL),
  telegram_chat_id TEXT,
  telegram_user_id TEXT,
  telegram_username TEXT,
  telegram_link_token TEXT,
  telegram_link_expires_at TEXT
);

CREATE TABLE IF NOT EXISTS tag_shares (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  share_id TEXT NOT NULL UNIQUE,
  tag_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT(NULL),
  expires_at TEXT DEFAULT(NULL)
);

CREATE TABLE IF NOT EXISTS api_tokens (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT 'items:read,items:write,tags:read,tags:write',
  last_used_at TEXT DEFAULT(NULL),
  created_at TEXT DEFAULT(NULL)
);

CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_parent ON tags(parent);
CREATE INDEX IF NOT EXISTS idx_items_tags_tag_id ON items_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_items_tags_item_id ON items_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_tag_shares_tag_id ON tag_shares(tag_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_favorite ON items(is_favorite);
CREATE INDEX IF NOT EXISTS idx_items_archived ON items(is_archived);
CREATE INDEX IF NOT EXISTS idx_items_broken ON items(is_broken);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_token ON users(telegram_link_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);
