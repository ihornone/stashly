'use client';

import * as React from 'react';
import { toast } from 'sonner';

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: 767px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < 768);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < 768);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copy = React.useCallback(
    async (text: string, showToast = true) => {
      if (!text) return false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        setIsCopied(true);
        if (showToast) {
          toast.success('Скопійовано в буфер обміну', { position: 'top-center' });
        }
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      } catch {
        if (showToast) {
          toast.error('Не вдалося скопіювати');
        }
        return false;
      }
    },
    [timeout]
  );

  return { isCopied, copy };
}
