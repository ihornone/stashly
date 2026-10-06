import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

/**
 * Telegram Bot API Client and Message Parsing Utilities for Stashly
 */

export interface TelegramSendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
  reply_to_message_id?: number;
}

export class TelegramBotClient {
  static getBotToken(): string {
    return env.TELEGRAM_BOT_TOKEN || '';
  }

  static getBotUsername(): string {
    return (env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
  }

  static isConfigured(): boolean {
    return Boolean(env.TELEGRAM_BOT_TOKEN);
  }

  static async sendApiRequest(method: string, body: Record<string, any>): Promise<any> {
    const token = this.getBotToken();
    if (!token) {
      return null;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();
      if (!data.ok) {
        logger.error({
          event: 'telegram_api_error',
          method,
          description: data.description,
        });
      }
      return data;
    } catch (err) {
      logger.error({
        event: 'telegram_api_fetch_failed',
        method,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  static async sendMessage(
    chatId: string | number,
    text: string,
    options: TelegramSendMessageOptions = {}
  ): Promise<any> {
    return this.sendApiRequest('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: options.parse_mode ?? 'HTML',
      disable_web_page_preview: options.disable_web_page_preview ?? false,
      reply_markup: options.reply_markup,
      reply_to_message_id: options.reply_to_message_id,
    });
  }

  static async sendPhoto(
    chatId: string | number,
    photoUrl: string,
    caption: string,
    options: TelegramSendMessageOptions = {}
  ): Promise<any> {
    return this.sendApiRequest('sendPhoto', {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: options.parse_mode ?? 'HTML',
      reply_markup: options.reply_markup,
      reply_to_message_id: options.reply_to_message_id,
    });
  }

  static async setWebhook(webhookUrl: string, secretToken?: string): Promise<any> {
    return this.sendApiRequest('setWebhook', {
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ['message', 'callback_query'],
    });
  }
}

/**
 * Parses message text and Telegram entities to extract:
 * - List of URLs
 * - List of hashtag names (without #)
 * - Remaining text as comments/notes
 */
export function parseTelegramMessageContent(
  text: string,
  entities: Array<{ type: string; offset: number; length: number; url?: string }> = []
): {
  urls: string[];
  hashtags: string[];
  comment: string;
} {
  const urls: string[] = [];
  const hashtags: string[] = [];

  // Extract from explicit Telegram entities
  if (entities && entities.length > 0) {
    for (const ent of entities) {
      if (ent.type === 'url') {
        const urlStr = text.substring(ent.offset, ent.offset + ent.length).trim();
        if (urlStr) {
          urls.push(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
        }
      } else if (ent.type === 'text_link' && ent.url) {
        urls.push(ent.url);
      } else if (ent.type === 'hashtag') {
        const tag = text.substring(ent.offset + 1, ent.offset + ent.length).trim();
        if (tag) hashtags.push(tag);
      }
    }
  }

  // Fallback regex detection if no entities or for freeform text
  if (urls.length === 0) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[1]);
    }
  }

  if (hashtags.length === 0) {
    const hashRegex = /#([\p{L}\p{N}_-]+)/gu;
    let match;
    while ((match = hashRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
  }

  // Clean comment: remove URLs and hashtags from text
  let comment = text;
  for (const u of urls) {
    comment = comment.replace(u, '');
  }
  for (const h of hashtags) {
    comment = comment.replace(new RegExp(`#${h}\\b`, 'gu'), '');
  }
  comment = comment.trim();

  return {
    urls: Array.from(new Set(urls)),
    hashtags: Array.from(new Set(hashtags)),
    comment,
  };
}

/**
 * Escapes text for Telegram HTML parse_mode
 */
export function escapeTelegramHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
