'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import Link from 'next/link';
import { KeyRound, Plus, Trash2, Copy, BookOpen } from 'lucide-react';

interface ApiTokenInfo {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
}

const SCOPES: Array<{ key: string; label: string }> = [
  { key: 'items:read', label: 'Читання закладок' },
  { key: 'items:write', label: 'Створення/редагування закладок' },
  { key: 'tags:read', label: 'Читання категорій' },
  { key: 'tags:write', label: 'Керування категоріями' },
  { key: 'share:write', label: 'Публікація категорій' },
  { key: 'tokens:manage', label: 'Керування токенами' },
];

export const ApiTokensTab = () => {
  const [tokens, setTokens] = React.useState<ApiTokenInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newName, setNewName] = React.useState('');
  const [newScopes, setNewScopes] = React.useState<string[]>(['items:read', 'tags:read']);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createdToken, setCreatedToken] = React.useState<string | null>(null);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/tokens');
      if (res.ok) {
        const json = await res.json();
        setTokens(json.data?.tokens ?? []);
      } else {
        toast.error('Не вдалося завантажити токени');
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadTokens();
  }, []);

  const toggleScope = (key: string) => {
    setNewScopes((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error('Вкажіть назву токена');
      return;
    }
    if (newScopes.length === 0) {
      toast.error('Оберіть хоча б один дозвіл');
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch('/api/settings/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes: newScopes }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        setCreatedToken(json.data.token);
        setNewName('');
        await loadTokens();
      } else {
        toast.error(json.message || 'Не вдалося створити токен');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    const res = await fetch(`/api/settings/tokens?token-id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Токен відкликано');
      await loadTokens();
    } else {
      toast.error('Не вдалося відкликати токен');
    }
  };

  const copyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success('Токен скопійовано');
    } catch {
      toast.error('Не вдалося скопіювати');
    }
  };

  return (
    <div className="space-y-5">
      {/* Create new token */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
          Новий токен
        </span>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Назва, напр. «n8n автоматизація»"
            className="h-10 text-sm"
            maxLength={100}
          />
          <Button onClick={handleCreate} disabled={isCreating} className="h-10 gap-2 text-xs rounded-xl font-medium shrink-0">
            {isCreating ? <Spinner className="size-4" /> : <Plus className="size-4" />}
            Створити
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          {SCOPES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={newScopes.includes(key)} onCheckedChange={() => toggleScope(key)} className="size-3.5" />
              <span className="font-mono text-[11px]">{key}</span>
              <span className="truncate">— {label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Plaintext token shown once after creation */}
      {createdToken && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3.5 space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <KeyRound className="size-3.5 text-emerald-500" />
            Токен створено — скопіюйте його зараз
          </p>
          <p className="text-[11px] text-muted-foreground">
            Він буде показаний лише один раз. Ми зберігаємо тільки його хеш.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono bg-muted/60 rounded-lg px-2.5 py-2 break-all select-all">
              {createdToken}
            </code>
            <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={copyToken} aria-label="Копіювати токен">
              <Copy className="size-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCreatedToken(null)}>
            Приховати
          </Button>
        </div>
      )}

      <div className="border-t border-border/50" />

      {/* Existing tokens */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
          Активні токени
        </span>
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5">
            <Spinner className="size-4" /> Завантажуємо...
          </div>
        ) : tokens.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2.5 bg-muted/40 rounded-xl">
            Ще немає токенів. Створіть перший, щоб використовувати REST API.
          </p>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground flex items-center gap-2">
                    <span className="truncate">{token.name}</span>
                    {token.revoked_at && (
                      <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded px-1 py-px shrink-0">
                        відкликано
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{token.prefix}…</p>
                  <p className="text-[10px] text-muted-foreground">
                    {token.scopes.join(', ')}
                    {token.last_used_at ? ` · використано ${token.last_used_at}` : ' · ще не використовувався'}
                  </p>
                </div>
                {!token.revoked_at && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRevoke(token.id)}
                    aria-label={`Відкликати токен ${token.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/docs/api/introduction"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookOpen className="size-3.5" />
        Документація REST API для розробників
      </Link>
    </div>
  );
};
