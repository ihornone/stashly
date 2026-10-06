import { describe, it, expect } from 'vitest';
import { env } from './env';

describe('Environment Configuration', () => {
  it('provides sensible defaults for development environment', () => {
    expect(env).toBeDefined();
    expect(typeof env.NODE_ENV).toBe('string');
    expect(typeof env.NEXT_PUBLIC_APP_URL).toBe('string');
    expect(typeof env.DATABASE_PATH).toBe('string');
    expect(typeof env.LOG_LEVEL).toBe('string');
  });

  it('validates URL format for NEXT_PUBLIC_APP_URL', () => {
    expect(() => new URL(env.NEXT_PUBLIC_APP_URL)).not.toThrow();
  });
});
