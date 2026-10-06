import React from 'react';

export const NotFound = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="w-full max-w-sm">
      {children || (
        <>
          <h1 className="text-2xl font-bold mb-2">404 — Сторінку не знайдено</h1>
          <p className="text-muted-foreground">Сторінка, яку ви шукаєте, не існує або була переміщена.</p>
        </>
      )}
    </div>
  </div>
);
