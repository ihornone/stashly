'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Send, CheckCircle2, Unlink, ExternalLink, RefreshCw, Copy, ShieldAlert, Sparkles, Hash, Search } from 'lucide-react';

interface TelegramStatus {
  connected: boolean;
  telegramUsername?: string | null;
  botConfigured: boolean;
  botUsername: string;
}

export const TelegramTab = () => {
  const [status, setStatus] = React.useState<TelegramStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isUnlinking, setIsUnlinking] = React.useState(false);
  const [linkData, setLinkData] = React.useState<{ token: string; botUrl: string } | null>(null);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/settings/telegram');
      if (res.ok) {
        const json = await res.json();
        const data = json.data as TelegramStatus;
        setStatus(data);
        if (data.connected) {
          setLinkData(null);
        }
      }
    } catch {
      toast.error('Не вдалося завантажити статус Telegram');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadStatus();
  }, []);

  // Poll status every 4 seconds if link token is active to automatically detect connection
  React.useEffect(() => {
    if (!linkData || status?.connected) return;
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, [linkData, status?.connected]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/settings/telegram', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.data) {
        setLinkData(json.data);
      } else {
        toast.error('Не вдалося згенерувати посилання');
      }
    } catch {
      toast.error('Помилка з\'єднання');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Ви впевнені, що хочете від\'єднати Telegram-бота?')) return;
    setIsUnlinking(true);
    try {
      const res = await fetch('/api/settings/telegram', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Telegram успішно від\'єднано');
        setStatus((prev) => (prev ? { ...prev, connected: false, telegramUsername: null } : null));
        setLinkData(null);
      } else {
        toast.error('Не вдалося від\'єднати Telegram');
      }
    } catch {
      toast.error('Помилка сервера');
    } finally {
      setIsUnlinking(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопійовано!`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto px-4 py-4 md:px-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Send className="size-4 text-[#229ED9]" />
          <h3 className="text-sm font-semibold text-foreground">Telegram Бот</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Зберігайте посилання у свій Stashly прямо з мобільного або десктопного Telegram.
        </p>
      </div>

      {/* Connected State */}
      {status?.connected ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Telegram підключено</span>
                  {status.telegramUsername && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      @{status.telegramUsername}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Будь-які посилання, надіслані боту, автоматично потрапляють у ваші закладки.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {status.botUsername && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/10"
                  asChild
                >
                  <a
                    href={`https://t.me/${status.botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Відкрити бота</span>
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUnlink}
                disabled={isUnlinking}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
              >
                {isUnlinking ? <Spinner className="size-3" /> : <Unlink className="size-3" />}
                <span>Від'єднати</span>
              </Button>
            </div>
          </div>

          {/* Quick instructions / features card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Sparkles className="size-3.5 text-primary" />
                <span>Збереження</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Перешліть або надішліть будь-який URL до чату з ботом.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Hash className="size-3.5 text-primary" />
                <span>Тегування</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Додавайте хештеги на кшталт <code className="text-[10px] bg-background px-1 py-0.5 rounded border">#dev</code>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Search className="size-3.5 text-primary" />
                <span>Пошук</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Введіть <code className="text-[10px] bg-background px-1 py-0.5 rounded border">/search запит</code> для швидкого пошуку.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Not Connected State */
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#229ED9]/10 text-[#229ED9] shrink-0">
                <Send className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">
                  Зберігайте посилання в 1 клік через Telegram
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Підключіть свій Telegram-акаунт, щоб ділитися посиланнями з будь-якого мобільного додатку прямо в Stashly з автоматичним парсингом заголовка, опису та картинок.
                </p>
              </div>
            </div>

            {linkData ? (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Одноразове посилання згенеровано</span>
                  <span className="text-[10px] text-muted-foreground">Діє 15 хвилин</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1.5 bg-[#229ED9] hover:bg-[#1f8ec4] text-white"
                    asChild
                  >
                    <a href={linkData.botUrl} target="_blank" rel="noopener noreferrer">
                      <Send className="size-3.5" />
                      <span>Відкрити бота в Telegram</span>
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`/start ${linkData.token}`, 'Команду для бота')}
                    className="text-xs gap-1.5 shrink-0"
                  >
                    <Copy className="size-3.5" />
                    <span>Копіювати команду</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Spinner className="size-3 text-primary animate-spin" />
                  <span>Очікуємо натискання «Start» у Telegram...</span>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  size="sm"
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="text-xs gap-1.5 bg-[#229ED9] hover:bg-[#1f8ec4] text-white"
                >
                  {isGenerating ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                  <span>Підключити Telegram-бота</span>
                </Button>
              </div>
            )}
          </div>

          {/* Features preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground px-1">Можливості інтеграції:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-border/50 bg-card text-xs space-y-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3 text-[#229ED9]" />
                  Швидкий Share
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Діліться посиланнями з браузера або будь-якого мобільного додатку.
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border/50 bg-card text-xs space-y-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Hash className="size-3 text-[#229ED9]" />
                  Хештеги
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Автоматичне створення та прив'язка тегів до збережених закладок.
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-border/50 bg-card text-xs space-y-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Search className="size-3 text-[#229ED9]" />
                  Миттєвий пошук
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Знаходьте свої закладки прямо у вікні чату за секунду.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
