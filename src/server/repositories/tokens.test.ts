import { describe, it, expect } from 'vitest';
import {
  generateApiToken,
  hashToken,
  parseScopes,
  formatTokenMask,
  validateScopeSelection,
  TOKEN_PREFIX,
} from './tokens';

describe('API Tokens Repository Helpers', () => {
  it('generates API token with correct prefix and SHA-256 hash', () => {
    const { token, tokenHash, tokenPrefix } = generateApiToken();
    expect(token.startsWith(TOKEN_PREFIX)).toBe(true);
    expect(tokenPrefix.startsWith(TOKEN_PREFIX)).toBe(true);
    expect(tokenHash).toBe(hashToken(token));
    expect(tokenHash.length).toBe(64); // SHA-256 hex length
  });

  it('correctly hashes token deterministically', () => {
    const raw = 'st__testtoken1234567890';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);
    expect(hash1).toBe(hash2);
  });

  it('parses and validates comma-separated scopes', () => {
    const parsed = parseScopes('items:read, tags:write, invalid_scope, items:write');
    expect(parsed).toEqual(['items:read', 'tags:write', 'items:write']);
  });

  it('validates scope selections', () => {
    const valid = validateScopeSelection(['items:read', 'tags:write']);
    expect(valid).toEqual(['items:read', 'tags:write']);

    const invalid = validateScopeSelection(['random:permission']);
    expect(invalid).toBeNull();
  });

  it('formats masked token correctly for display', () => {
    const masked = formatTokenMask('st__abcdef12');
    expect(masked).toBe('st__abcdef12••••••••');
  });
});
