'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export const useUrlState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  // Create a mutable copy of searchParams
  const searchParams = useMemo(() => {
    return new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : '');
  }, [nextSearchParams]);

  const setUrlState = useCallback(
    (updates: Record<string, string | number | null>, options?: { replace?: boolean }) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          current.delete(key);
        } else {
          current.set(key, `${value}`);
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      const url = `${pathname}${query}`;

      if (options?.replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  return { searchParams, setUrlState };
};
