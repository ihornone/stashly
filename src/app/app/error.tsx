'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logger.error({
      event: 'app_error_boundary_caught',
      error: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="flex flex-col items-center max-w-md space-y-5">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Щось пішло не так</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Виникла непередбачувана помилка під час завантаження сторінки. Спробуйте повторити запит.
          </p>
          {error?.message ? (
            <p className="text-xs font-mono text-muted-foreground/80 bg-muted/40 p-2 rounded-lg break-all">
              {error.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            variant="default"
            className="rounded-xl gap-2 font-medium cursor-pointer"
          >
            <RotateCcw className="size-4" />
            Спробувати знову
          </Button>

          <Button asChild variant="outline" className="rounded-xl gap-2 font-medium">
            <Link href="/app">
              <Home className="size-4" />
              На головну
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
