import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotClient, parseTelegramMessageContent, escapeTelegramHtml } from '@/server/telegram';
import { TelegramRepository } from '@/server/repositories/telegram';
import { ItemRepository } from '@/server/repositories/items';
import { TagRepository } from '@/server/repositories/tags';
import { scrapeUrlMetadata } from '@/server/scraper';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Optional secret token verification
    const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await req.json();
    if (!update || !update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = (message.text || message.caption || '').trim();
    const entities = message.entities || message.caption_entities || [];
    const fromUser = message.from || {};

    const siteUrl = env.NEXT_PUBLIC_APP_URL || 'https://stashly.ihornone.site';

    // 1. Handle /start command (with optional deep-link token)
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const token = parts[1]?.trim();

      if (token) {
        const linkedUser = await TelegramRepository.linkTelegramAccount(token, {
          id: fromUser.id,
          username: fromUser.username,
          chat_id: chatId,
        });

        if (linkedUser) {
          await TelegramBotClient.sendMessage(
            chatId,
            `🎉 <b>Вітаємо! Ваш Telegram успішно підключено до Stashly (${escapeTelegramHtml(
              linkedUser.username
            )}).</b>\n\n` +
              `Тепер ви можете просто пересилати або писати сюди будь-які посилання — вони миттєво зберігатимуться у вашій колекції!\n\n` +
              `💡 <i>Порада: ви можете додавати хештеги (наприклад: #dev #дизайн) або коментарі разом із посиланням, і Stashly автоматично прив'яже відповідні категорії.</i>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Відкрити Stashly', url: `${siteUrl}/app` }],
                ],
              },
            }
          );
        } else {
          await TelegramBotClient.sendMessage(
            chatId,
            `⚠️ <b>Недійсний або застарілий код підключення.</b>\n\nБудь ласка, перейдіть у <b>Налаштування Stashly -> Telegram</b> на сайті та натисніть «Підключити Telegram-бота», щоб отримати актуальне посилання.`
          );
        }
        return NextResponse.json({ ok: true });
      }

      // /start without token
      const existingUser = await TelegramRepository.getUserByTelegramChatId(chatId);
      if (existingUser) {
        await TelegramBotClient.sendMessage(
          chatId,
          `👋 <b>Привіт! Ваш акаунт Stashly (${escapeTelegramHtml(
            existingUser.username
          )}) вже підключено.</b>\n\n` +
            `Надішліть мені будь-яке посилання, щоб зберегти його.\n\n` +
            `<b>Доступні команди:</b>\n` +
            `• <code>/search &lt;запит&gt;</code> — пошук по ваших закладках\n` +
            `• <code>/status</code> — статус підключення\n` +
            `• <code>/unlink</code> — від'єднати цей Telegram-акаунт\n` +
            `• <code>/help</code> — довідка`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '📂 Мої закладки', url: `${siteUrl}/app` }],
              ],
            },
          }
        );
      } else {
        await TelegramBotClient.sendMessage(
          chatId,
          `👋 <b>Привіт! Я офіційний бот Stashly.</b>\n\n` +
            `Я допомагаю зберігати посилання у ваш персональний менеджер закладок прямо з Telegram.\n\n` +
            `Щоб прив'язати цей чат до вашого акаунту:\n` +
            `1. Відкрийте <a href="${siteUrl}/app">Stashly</a>\n` +
            `2. Перейдіть у <b>Налаштування ⚙️ ➔ Telegram</b>\n` +
            `3. Натисніть <b>«Підключити Telegram-бота»</b>.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Check if user is linked for all other interactions
    const user = await TelegramRepository.getUserByTelegramChatId(chatId);
    if (!user) {
      await TelegramBotClient.sendMessage(
        chatId,
        `⚠️ <b>Telegram ще не підключено до Stashly.</b>\n\n` +
          `Щоб зберігати посилання, відкрийте <a href="${siteUrl}/app">Stashly</a> ➔ <b>Налаштування ⚙️ ➔ Telegram</b> та натисніть «Підключити».`
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Handle /status command
    if (text === '/status') {
      await TelegramBotClient.sendMessage(
        chatId,
        `✅ <b>Статус підключення:</b> Активно\n` +
          `👤 <b>Користувач Stashly:</b> ${escapeTelegramHtml(user.username)}\n` +
          `🆔 <b>ID чату:</b> <code>${chatId}</code>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Перейти в Stashly', url: `${siteUrl}/app` }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 3. Handle /unlink command
    if (text === '/unlink') {
      await TelegramRepository.unlinkTelegramAccount(user.id);
      await TelegramBotClient.sendMessage(
        chatId,
        `🔌 <b>Telegram-акаунт успішно від'єднано від Stashly.</b>\n\nВи завжди можете підключити його знову в Налаштуваннях сайту.`
      );
      return NextResponse.json({ ok: true });
    }

    // 4. Handle /help command
    if (text === '/help') {
      await TelegramBotClient.sendMessage(
        chatId,
        `ℹ️ <b>Як користуватися ботом Stashly:</b>\n\n` +
          `1. <b>Збереження закладок:</b> просто надішліть або перешліть сюди посилання (наприклад: <code>https://github.com #dev крутий проєкт</code>).\n` +
          `2. <b>Теги:</b> пишіть хештеги (наприклад <code>#tech</code>, <code>#дизайн</code>), і вони автоматично додадуться як категорії.\n` +
          `3. <b>Пошук:</b> напишіть <code>/search react</code>, щоб знайти збережені закладки.\n` +
          `4. <b>Від'єднання:</b> команда <code>/unlink</code>.`
      );
      return NextResponse.json({ ok: true });
    }

    // 5. Handle /search command
    if (text.startsWith('/search')) {
      const query = text.replace(/^\/search\s*/, '').trim();
      if (!query) {
        await TelegramBotClient.sendMessage(
          chatId,
          `🔍 Вкажіть пошуковий запит, наприклад: <code>/search github</code>`
        );
        return NextResponse.json({ ok: true });
      }

      const searchRes = await ItemRepository.getItemsPage(user.id, { q: query, perPage: 5 });
      if (searchRes.items.length === 0) {
        await TelegramBotClient.sendMessage(
          chatId,
          `🔍 За запитом «<b>${escapeTelegramHtml(query)}</b>» нічого не знайдено.`
        );
        return NextResponse.json({ ok: true });
      }

      let responseText = `🔍 <b>Результати пошуку для «${escapeTelegramHtml(query)}» (${searchRes.total}):</b>\n\n`;
      searchRes.items.forEach((item, index) => {
        const itemTitle = escapeTelegramHtml(item.title || item.url);
        responseText += `${index + 1}. <a href="${item.url}">${itemTitle}</a>\n`;
        if (item.description) {
          responseText += `   <i>${escapeTelegramHtml(item.description.substring(0, 90))}...</i>\n`;
        }
      });

      await TelegramBotClient.sendMessage(chatId, responseText, {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔍 Відкрити пошук у додатку', url: `${siteUrl}/app?search=${encodeURIComponent(query)}` }],
          ],
        },
      });
      return NextResponse.json({ ok: true });
    }

    // 6. Handle link saving (Text or forwarded message with URLs)
    const { urls, hashtags, comment } = parseTelegramMessageContent(text, entities);

    if (urls.length === 0) {
      await TelegramBotClient.sendMessage(
        chatId,
        `💡 Надішліть мені посилання (URL), щоб зберегти його в Stashly. Наприклад:\n<code>https://nextjs.org #framework #react</code>`
      );
      return NextResponse.json({ ok: true });
    }

    // Process hashtags into tags
    const tagIds: number[] = [];
    for (const tagTitle of hashtags) {
      const tagId = await TagRepository.createTag(tagTitle, '', 0, user.id);
      tagIds.push(tagId);
    }

    // Save each URL found
    for (const rawUrl of urls) {
      try {
        const meta = await scrapeUrlMetadata(rawUrl);
        const title = meta.title || rawUrl;
        const description = meta.description || '';
        const image = meta.image || '';

        await ItemRepository.createItem(
          {
            title,
            description,
            url: rawUrl,
            comments: comment || '',
            image,
            tags: tagIds,
          },
          user.id
        );

        const escapedTitle = escapeTelegramHtml(title);
        const tagsBadge = hashtags.length > 0 ? hashtags.map((h) => `#${escapeTelegramHtml(h)}`).join(' ') : '';

        let replyMsg = `✅ <b>Збережено в Stashly!</b>\n\n`;
        replyMsg += `📌 <b><a href="${rawUrl}">${escapedTitle}</a></b>\n`;
        if (description) {
          replyMsg += `<i>${escapeTelegramHtml(description.substring(0, 160))}${description.length > 160 ? '...' : ''}</i>\n`;
        }
        if (comment) {
          replyMsg += `💬 <i>${escapeTelegramHtml(comment)}</i>\n`;
        }
        if (tagsBadge) {
          replyMsg += `🏷️ ${tagsBadge}\n`;
        }

        await TelegramBotClient.sendMessage(chatId, replyMsg, {
          reply_to_message_id: message.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Переглянути в Stashly', url: `${siteUrl}/app` }],
            ],
          },
        });
      } catch (saveErr) {
        logger.error({
          event: 'telegram_webhook_save_bookmark_failed',
          error: saveErr instanceof Error ? saveErr.message : String(saveErr),
          url: rawUrl,
          chatId,
        });
        await TelegramBotClient.sendMessage(
          chatId,
          `⚠️ Не вдалося зберегти <code>${escapeTelegramHtml(rawUrl)}</code>. Спробуйте пізніше.`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({
      event: 'telegram_webhook_error',
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: true });
  }
}
