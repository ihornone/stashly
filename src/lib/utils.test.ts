import { describe, it, expect } from 'vitest';
import {
  cn,
  isNavLinkActive,
  isCustomColor,
  getTagColorRaw,
  safeDecodeURI,
  safeDecodeURIComponent,
  normalizeQuery,
  formatDateUk,
  buildGoLinkURL,
} from './utils';

describe('UI & Utility Functions', () => {
  describe('cn (Tailwind class merger)', () => {
    it('merges class names and resolves tailwind collisions', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'font-bold', undefined, null, false && 'hidden')).toBe(
        'text-red-500 font-bold'
      );
    });
  });

  describe('isNavLinkActive', () => {
    it('detects active links by prefix path', () => {
      expect(isNavLinkActive('/docs/getting-started', '/docs')).toBe(true);
      expect(isNavLinkActive('/app/settings', '/app')).toBe(true);
      expect(isNavLinkActive('/privacy', '/terms')).toBe(false);
      expect(isNavLinkActive('/#features', '/#features')).toBe(false);
    });
  });

  describe('Color Helpers', () => {
    it('detects custom hex and rgb colors', () => {
      expect(isCustomColor('#ff00aa')).toBe(true);
      expect(isCustomColor('rgb(255, 0, 0)')).toBe(true);
      expect(isCustomColor('hsl(200, 50%, 50%)')).toBe(true);
      expect(isCustomColor('blue')).toBe(false);
      expect(isCustomColor(undefined)).toBe(false);
    });

    it('resolves raw color codes correctly', () => {
      expect(getTagColorRaw('green')).toBe('#22c55e');
      expect(getTagColorRaw('aqua')).toBe('#3b82f6');
      expect(getTagColorRaw('#abcdef')).toBe('#abcdef');
      expect(getTagColorRaw(undefined)).toBe('#64748b');
    });
  });

  describe('safeDecodeURI & safeDecodeURIComponent', () => {
    it('safely decodes URI components without throwing on malformed inputs', () => {
      expect(safeDecodeURIComponent('https%3A%2F%2Fexample.com')).toBe('https://example.com');
      expect(safeDecodeURIComponent('normal-text')).toBe('normal-text');
      expect(safeDecodeURI('https://example.com/hello%20world')).toBe('https://example.com/hello world');
      expect(safeDecodeURIComponent('%E0%A4%A')).toBe('%E0%A4%A'); // Malformed, should fallback safely
    });
  });

  describe('normalizeQuery', () => {
    it('strips leading and trailing slashes and extra whitespace', () => {
      expect(normalizeQuery(' /docs/getting-started/ ')).toBe('docs/getting-started');
      expect(normalizeQuery('///api///')).toBe('api');
    });
  });

  describe('buildGoLinkURL', () => {
    it('builds tracking url with utm parameters', () => {
      const url = buildGoLinkURL('extension');
      expect(url).toContain('https://stashly.ihornone.site/go/extension');
      expect(url).toContain('utm_source=web_app');
    });
  });

  describe('formatDateUk', () => {
    it('formats ISO date string in Ukrainian locale format', () => {
      const formatted = formatDateUk('2026-10-07T12:00:00Z');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatDateUk(null)).toBe('');
    });
  });
});
