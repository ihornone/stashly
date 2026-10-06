'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

/**
 * Registers the service worker and shows the offline badge.
 * When a new SW version finishes installing, the user gets a refresh toast
 * (the SW itself only activates on a SKIP_WAITING message).
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Online/offline listeners
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast('Доступна нова версія додатку', {
                    position: 'top-center',
                    duration: Infinity,
                    action: {
                      label: 'Оновити',
                      onClick: () => {
                        navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
                        navigator.serviceWorker.addEventListener('controllerchange', () => {
                          window.location.reload();
                        });
                      },
                    },
                  });
                }
              };
            }
          };
        })
        .catch((error) => {
          logger.warn({
            event: 'pwa_service_worker_registration_failed',
            error: error instanceof Error ? error.message : String(error),
          });
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      {!isOnline && (
        <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-lg bg-amber-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          Офлайн-режим
        </div>
      )}
    </>
  );
}
