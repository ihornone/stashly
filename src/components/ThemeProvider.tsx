'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme, type ThemeProviderProps as NextThemesProviderProps } from 'next-themes';

export type Theme = 'dark' | 'light' | 'system';

export type ThemeProviderProps = NextThemesProviderProps;

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'class',
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      attribute={attribute}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme, systemTheme, themes } = useNextTheme();

  return {
    theme: (theme as Theme) || 'system',
    setTheme: (t: Theme | string) => setTheme(t),
    systemTheme,
    themes,
  };
};
