// Cloudflare environment type declarations
interface CloudflareEnv {
  DB?: any;
  R2_IMAGES?: any;
  NEXT_CACHE_WORKERS_KV?: any;
  ENVIRONMENT?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  NEXT_PUBLIC_APP_URL?: string;
}
