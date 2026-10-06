'use client';

import React from 'react';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Щось пішло не так</h2>
      <p className="text-sm text-muted-foreground mb-4">Виникла помилка під час завантаження даних.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Спробувати знову
      </button>
    </div>
  );
}
