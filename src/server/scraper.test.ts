import { describe, it, expect } from 'vitest';
import { isPublicIp, validateSafeUrl } from './scraper';

describe('SSRF Protection & URL Validation', () => {
  describe('isPublicIp', () => {
    it('blocks localhost and loopback IPv4 addresses', () => {
      expect(isPublicIp('localhost')).toBe(false);
      expect(isPublicIp('127.0.0.1')).toBe(false);
      expect(isPublicIp('127.1.2.3')).toBe(false);
      expect(isPublicIp('0.0.0.0')).toBe(false);
    });

    it('blocks loopback and local IPv6 addresses', () => {
      expect(isPublicIp('::1')).toBe(false);
      expect(isPublicIp('::')).toBe(false);
      expect(isPublicIp('fc00::1')).toBe(false);
      expect(isPublicIp('fe80::1')).toBe(false);
    });

    it('blocks private RFC 1918 IPv4 ranges', () => {
      expect(isPublicIp('10.0.0.1')).toBe(false);
      expect(isPublicIp('10.255.255.255')).toBe(false);
      expect(isPublicIp('192.168.1.1')).toBe(false);
      expect(isPublicIp('192.168.0.100')).toBe(false);
      expect(isPublicIp('172.16.0.1')).toBe(false);
      expect(isPublicIp('172.31.255.255')).toBe(false);
    });

    it('blocks cloud metadata endpoints', () => {
      expect(isPublicIp('169.254.169.254')).toBe(false);
      expect(isPublicIp('metadata.google.internal')).toBe(false);
    });

    it('blocks internal and local domain suffixes', () => {
      expect(isPublicIp('my-service.local')).toBe(false);
      expect(isPublicIp('database.internal')).toBe(false);
      expect(isPublicIp('router.lan')).toBe(false);
      expect(isPublicIp('nas.home')).toBe(false);
    });

    it('allows legitimate public hostnames and IP addresses', () => {
      expect(isPublicIp('github.com')).toBe(true);
      expect(isPublicIp('google.com')).toBe(true);
      expect(isPublicIp('1.1.1.1')).toBe(true);
      expect(isPublicIp('8.8.8.8')).toBe(true);
      expect(isPublicIp('172.15.0.1')).toBe(true); // Outside 172.16-31
      expect(isPublicIp('172.32.0.1')).toBe(true); // Outside 172.16-31
    });
  });

  describe('validateSafeUrl', () => {
    it('validates safe public HTTP and HTTPS URLs', () => {
      const parsed = validateSafeUrl('https://example.com/path?query=1');
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.protocol).toBe('https:');
    });

    it('rejects unsupported protocols', () => {
      expect(() => validateSafeUrl('ftp://example.com')).toThrow('Only http and https protocols are supported');
      expect(() => validateSafeUrl('file:///etc/passwd')).toThrow('Only http and https protocols are supported');
      expect(() => validateSafeUrl('javascript:alert(1)')).toThrow('Only http and https protocols are supported');
    });

    it('rejects internal IP addresses and hostnames', () => {
      expect(() => validateSafeUrl('http://127.0.0.1:8080/admin')).toThrow('Access to private/internal networks is forbidden');
      expect(() => validateSafeUrl('http://localhost:3000')).toThrow('Access to private/internal networks is forbidden');
      expect(() => validateSafeUrl('http://192.168.1.1')).toThrow('Access to private/internal networks is forbidden');
      expect(() => validateSafeUrl('http://169.254.169.254/latest/meta-data/')).toThrow('Access to private/internal networks is forbidden');
    });

    it('rejects invalid URL strings', () => {
      expect(() => validateSafeUrl('not a url')).toThrow('Invalid URL format');
    });
  });
});
