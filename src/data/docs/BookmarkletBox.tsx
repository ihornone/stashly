'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const BookmarkletBox: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const bookmarkletCode = `javascript:(function(){var u='${typeof window !== 'undefined' ? window.location.origin : 'https://stashly.ihornone.site'}/app/create-item?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title);window.open(u,'_blank','width=720,height=800,popup=1');})();`;

  const copyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Код букмарклета:</span>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              <span>Скопійовано!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Скопіювати код</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 bg-muted/40 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all border border-border/40">
        {bookmarkletCode}
      </pre>
      <p className="text-xs text-muted-foreground">
        <strong>Інструкція:</strong> Створіть нову закладку в браузері (наприклад, з назвою <em>«+ Зберегти в Stashly»</em>) і вставте цей скопійований код у поле URL.
      </p>
    </div>
  );
};
