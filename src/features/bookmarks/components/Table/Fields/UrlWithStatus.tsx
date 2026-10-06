'use client';

import * as React from 'react';
import { mainStore } from '@/store/mainStore';
import { observer } from 'mobx-react-lite';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UrlWithStatus = observer(({ url, itemId }: { url: string; itemId: number }) => {
  const store = mainStore;
  const linkStatus = store.brokenLinkStatuses[itemId];

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      <a
        className="underline break-all hover:text-primary transition-colors truncate max-w-full"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={url}
      >
        {url}
      </a>

      {linkStatus?.status === 'broken' && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <AlertCircle className="w-3 h-3" />
              <span>Недоступний ({linkStatus.error || linkStatus.statusCode})</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Посилання повертає помилку: {linkStatus.error || `HTTP ${linkStatus.statusCode}`}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {linkStatus?.status === 'warning' && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <AlertCircle className="w-3 h-3" />
              <span>{linkStatus.error || `HTTP ${linkStatus.statusCode}`}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Сайт захищений або вимагає авторизації ({linkStatus.error || `HTTP ${linkStatus.statusCode}`})</p>
          </TooltipContent>
        </Tooltip>
      )}

      {linkStatus?.status === 'checking' && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
        </span>
      )}
    </div>
  );
});
