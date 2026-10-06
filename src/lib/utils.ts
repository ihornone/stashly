import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType, LayoutType } from '@/lib/types';
import { VisibilityState } from '@tanstack/react-table';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (!href.startsWith('/') || href.startsWith('/#')) return false;
  const base = '/' + href.split('/')[1];
  return pathname.startsWith(base);
}

export const colorHexMap: Record<string, string> = {
  gray: '#64748b',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  aqua: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
  white: '#e2e8f0',
  black: '#1e293b',
};

export const TAG_COLOR_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'aqua', label: 'Блакитний' },
  { key: 'green', label: 'Зелений' },
  { key: 'purple', label: 'Фіолетовий' },
  { key: 'pink', label: 'Рожевий' },
  { key: 'orange', label: 'Помаранчевий' },
  { key: 'yellow', label: 'Жовтий' },
  { key: 'red', label: 'Червоний' },
  { key: 'gray', label: 'Сірий' },
  { key: 'white', label: 'Світлий' },
  { key: 'black', label: 'Темний' },
];

export const colorMap: Record<string, string> = {
  gray: 'bg-slate-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  aqua: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  white: 'bg-slate-200',
  black: 'bg-slate-900',
};

/**
 * Checks if color is a hex code (#fff, #123456) or rgb/hsl string
 */
export const isCustomColor = (color: string | undefined): boolean => {
  if (!color) return false;
  return color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl');
};

/**
 * Returns raw hex or color string for a given color key or custom value
 */
export const getTagColorRaw = (color: string | undefined): string => {
  if (!color) return '#64748b';
  if (isCustomColor(color)) return color;
  return colorHexMap[color] || '#64748b';
};

export const getColorClass = (color: string | undefined) => {
  if (!color) return colorMap.gray;
  if (isCustomColor(color)) return '';
  return colorMap[color] || colorMap.gray;
};

export const getColorStyle = (color: string | undefined): React.CSSProperties | undefined => {
  if (isCustomColor(color)) {
    return { backgroundColor: color };
  }
  return undefined;
};

export const normalizeQuery = (val: string) => {
  return val
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
    .trim();
};

export const getSavedLayoutPreference = (): LayoutType => {
  return (localStorage.getItem('layout') as LayoutType) || 'list';
};

export const saveLayoutPreference = (value: LayoutType): void => {
  try {
    localStorage.setItem('layout', value);
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};

export const getSavedLayoutColumnVisibilityPreference = (
  layout: LayoutType
): Partial<Record<keyof ItemType, boolean>> => {
  const defaultPref = {
    updated_at: false,
  };
  try {
    const stored = localStorage.getItem(`column-visibility-${layout}`);
    return stored ? JSON.parse(stored) : defaultPref;
  } catch {
    return defaultPref;
  }
};

export const saveLayoutColumnVisibilityPreference = (layout: LayoutType, columnVisibility: VisibilityState): void => {
  try {
    localStorage.setItem(`column-visibility-${layout}`, JSON.stringify(columnVisibility));
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const cookieString = '; ' + document.cookie;
  const parts = cookieString.split('; ' + name + '=');
  if (parts.length === 2) {
    const lastPart = parts.pop();
    return lastPart ? (lastPart.split(';').shift() || null) : null;
  }
  return null;
};

export const safeDecodeURIComponent = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURIComponent(encodedURI) : '';
  } catch {
    return encodedURI || '';
  }
};

export const safeDecodeURI = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURI(encodedURI) : '';
  } catch {
    return encodedURI || '';
  }
};

export const buildGoLinkURL = (path: string, params?: Record<string, string>) => {
  const utmParams = new URLSearchParams({
    utm_source: 'web_app',
    utm_medium: 'in_app',
    ...params,
  });

  return `https://stashly.ihornone.site/go/${path}?${utmParams.toString()}`;
};

export const formatDateUk = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};
