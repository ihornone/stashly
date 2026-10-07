export async function register() {
  if (typeof globalThis.MessagePort === 'undefined' || typeof globalThis.MessageChannel === 'undefined') {
    try {
      // In Cloudflare Workers with nodejs_compat, node:worker_threads provides standard MessagePort and MessageChannel
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const wt = require('node:worker_threads');
      if (typeof globalThis.MessagePort === 'undefined' && wt?.MessagePort) {
        (globalThis as any).MessagePort = wt.MessagePort;
      }
      if (typeof globalThis.MessageChannel === 'undefined' && wt?.MessageChannel) {
        (globalThis as any).MessageChannel = wt.MessageChannel;
      }
    } catch {
      // Fallback dummy polyfill if worker_threads cannot be loaded
      if (typeof globalThis.MessagePort === 'undefined') {
        (globalThis as any).MessagePort = class MessagePort {};
      }
      if (typeof globalThis.MessageChannel === 'undefined') {
        (globalThis as any).MessageChannel = class MessageChannel {
          port1 = new (globalThis as any).MessagePort();
          port2 = new (globalThis as any).MessagePort();
        };
      }
    }
  }
}
