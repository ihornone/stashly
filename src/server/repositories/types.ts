import { randomBytes } from 'crypto';

export interface User {
  id: number;
  clerk_id?: string | null;
  email?: string | null;
  username: string;
  password_hash: string;
  preferences?: string | null;
  telegram_chat_id?: string | null;
  telegram_user_id?: string | null;
  telegram_username?: string | null;
  telegram_link_token?: string | null;
  telegram_link_expires_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ItemRow {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  url: string;
  comments: string;
  image: string;
  created_at: string | null;
  updated_at: string | null;
  tags?: number[];
}

export interface TagRow {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  color: string;
  parent: number;
  pinned: number;
  share_id?: string | null;
  is_shared?: number;
  created_at: string | null;
  updated_at: string | null;
}

export function generateShareId(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = randomBytes(10);
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
}

export function safeDecodeURI(str: string): string {
  if (!str) return '';
  try {
    return decodeURI(str);
  } catch {
    return str;
  }
}

export function safeEncodeURI(str: string): string {
  if (!str) return '';
  if (str.startsWith('data:')) return str;
  try {
    return encodeURI(safeDecodeURI(str));
  } catch {
    return str;
  }
}
