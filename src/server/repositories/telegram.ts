import { getD1Database, checkDatabaseExists } from '../db';
import { User } from './types';
import { randomBytes } from 'crypto';
import { TelegramBotClient } from '../telegram';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export class TelegramRepository {
  /**
   * Generates a one-time connection token for a user (valid for 15 minutes).
   */
  static async generateLinkToken(userId: number): Promise<{ token: string; botUrl: string; expiresAt: string }> {
    const db = getD1Database();
    const token = randomBytes(8).toString('hex'); // 16 chars hex
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    await db
      .prepare('UPDATE users SET telegram_link_token = ?, telegram_link_expires_at = ? WHERE id = ?')
      .bind(token, expiresAt, userId)
      .run();

    const botUsername = TelegramBotClient.getBotUsername();
    const botUrl = botUsername ? `https://t.me/${botUsername}?start=${token}` : '';

    return { token, botUrl, expiresAt };
  }

  /**
   * Links a Telegram user to a Stashly account using a valid one-time token.
   */
  static async linkTelegramAccount(
    token: string,
    tg: { id: string | number; username?: string; chat_id: string | number }
  ): Promise<User | null> {
    const exists = await checkDatabaseExists();
    if (!exists) return null;
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Find user with matching, non-expired token
    const user = await db
      .prepare(
        'SELECT * FROM users WHERE telegram_link_token = ? AND telegram_link_expires_at > ?'
      )
      .bind(token, now)
      .first<User>();

    if (!user) return null;

    const chatIdStr = String(tg.chat_id);
    const userIdStr = String(tg.id);
    const username = tg.username || null;

    // Link account and clear one-time token
    await db
      .prepare(
        'UPDATE users SET telegram_chat_id = ?, telegram_user_id = ?, telegram_username = ?, telegram_link_token = NULL, telegram_link_expires_at = NULL, updated_at = ? WHERE id = ?'
      )
      .bind(chatIdStr, userIdStr, username, now, user.id)
      .run();

    return {
      ...user,
      telegram_chat_id: chatIdStr,
      telegram_user_id: userIdStr,
      telegram_username: username,
      telegram_link_token: null,
      telegram_link_expires_at: null,
      updated_at: now,
    };
  }

  /**
   * Finds a user by their Telegram chat ID.
   */
  static async getUserByTelegramChatId(chatId: string | number): Promise<User | null> {
    const exists = await checkDatabaseExists();
    if (!exists) return null;
    const db = getD1Database();
    const chatIdStr = String(chatId);

    return await db
      .prepare('SELECT * FROM users WHERE telegram_chat_id = ?')
      .bind(chatIdStr)
      .first<User>();
  }

  /**
   * Disconnects a Telegram account from Stashly.
   */
  static async unlinkTelegramAccount(userId: number): Promise<boolean> {
    const exists = await checkDatabaseExists();
    if (!exists) return false;
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await db
      .prepare(
        'UPDATE users SET telegram_chat_id = NULL, telegram_user_id = NULL, telegram_username = NULL, telegram_link_token = NULL, telegram_link_expires_at = NULL, updated_at = ? WHERE id = ?'
      )
      .bind(now, userId)
      .run();

    return true;
  }

  /**
   * Retrieves connection status for the settings dialog.
   */
  static async getTelegramStatus(userId: number): Promise<{
    connected: boolean;
    telegramUsername?: string | null;
    botConfigured: boolean;
    botUsername: string;
  }> {
    const exists = await checkDatabaseExists();
    if (!exists) {
      return { connected: false, botConfigured: false, botUsername: '' };
    }
    const db = getD1Database();
    const user = await db
      .prepare('SELECT telegram_chat_id, telegram_username FROM users WHERE id = ?')
      .bind(userId)
      .first<{ telegram_chat_id?: string | null; telegram_username?: string | null }>();

    const botConfigured = TelegramBotClient.isConfigured();
    const botUsername = TelegramBotClient.getBotUsername();

    return {
      connected: Boolean(user?.telegram_chat_id),
      telegramUsername: user?.telegram_username || null,
      botConfigured,
      botUsername,
    };
  }

  /**
   * Sends a notification to the user's linked Telegram chat when a bookmark is created on the site / API.
   */
  static async notifyBookmarkCreated(
    userId: number,
    item: { id?: number; title: string; url: string; description?: string; comments?: string; tags?: number[] },
    source: string = 'веб-сайту'
  ): Promise<boolean> {
    try {
      const exists = await checkDatabaseExists();
      if (!exists) return false;
      const db = getD1Database();
      const user = await db
        .prepare('SELECT telegram_chat_id FROM users WHERE id = ?')
        .bind(userId)
        .first<{ telegram_chat_id?: string | null }>();

      if (!user?.telegram_chat_id) return false;

      const siteUrl = env.NEXT_PUBLIC_APP_URL || 'https://stashly.ihornone.site';
      const escapedTitle = (item.title || item.url)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      let tagBadges = '';
      if (item.tags && item.tags.length > 0) {
        const { TagRepository } = await import('./tags');
        const allTags = await TagRepository.getTags(userId);
        const tagNames = item.tags.map((tid) => allTags[tid]?.title).filter(Boolean);
        if (tagNames.length > 0) {
          tagBadges = tagNames.map((name) => `#${name}`).join(' ');
        }
      }

      let text = `📌 <b>Нова закладка збережена (${source})!</b>\n\n`;
      text += `🔗 <a href="${item.url}">${escapedTitle}</a>\n`;
      if (item.description) {
        const desc = item.description.substring(0, 150);
        text += `<i>${desc}${item.description.length > 150 ? '...' : ''}</i>\n`;
      }
      if (item.comments) {
        text += `💬 <i>${item.comments}</i>\n`;
      }
      if (tagBadges) {
        text += `🏷️ ${tagBadges}\n`;
      }

      await TelegramBotClient.sendMessage(user.telegram_chat_id, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Відкрити в Stashly', url: `${siteUrl}/app` }],
          ],
        },
      });
      return true;
    } catch (err) {
      logger.warn({
        event: 'telegram_notification_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }
}
