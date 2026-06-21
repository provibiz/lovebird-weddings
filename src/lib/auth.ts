// Minimal env-based auth for the client dashboard (prototype).
// A signed cookie carries a single "admin" session — no user store, no roles.

const COOKIE = 'lw_session';
const encoder = new TextEncoder();

export interface RuntimeEnv {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  COSMIC_BUCKET_SLUG?: string;
  COSMIC_READ_KEY?: string;
  COSMIC_WRITE_KEY?: string;
  CLOUDFLARE_DEPLOY_HOOK_URL?: string;
}

/**
 * Reads env from the Cloudflare runtime (locals.runtime.env) when present,
 * falling back to import.meta.env for local `astro dev`/`build`.
 */
export function getEnv(locals: any): RuntimeEnv {
  const runtime = locals?.runtime?.env ?? {};
  const build = import.meta.env ?? {};
  return {
    ADMIN_USERNAME: runtime.ADMIN_USERNAME ?? build.ADMIN_USERNAME,
    ADMIN_PASSWORD: runtime.ADMIN_PASSWORD ?? build.ADMIN_PASSWORD,
    SESSION_SECRET: runtime.SESSION_SECRET ?? build.SESSION_SECRET,
    COSMIC_BUCKET_SLUG: runtime.COSMIC_BUCKET_SLUG ?? build.COSMIC_BUCKET_SLUG,
    COSMIC_READ_KEY: runtime.COSMIC_READ_KEY ?? build.COSMIC_READ_KEY,
    COSMIC_WRITE_KEY: runtime.COSMIC_WRITE_KEY ?? build.COSMIC_WRITE_KEY,
    CLOUDFLARE_DEPLOY_HOOK_URL:
      runtime.CLOUDFLARE_DEPLOY_HOOK_URL ?? build.CLOUDFLARE_DEPLOY_HOOK_URL,
  };
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = `admin.${Date.now()}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(secret: string, token?: string): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(secret, payload);
  // constant-time-ish comparison
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(env: RuntimeEnv, username: string, password: string): boolean {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return false;
  return username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
}

export const SESSION_COOKIE = COOKIE;

export async function isAuthenticated(locals: any, cookies: any): Promise<boolean> {
  const env = getEnv(locals);
  if (!env.SESSION_SECRET) return false;
  return verifySessionToken(env.SESSION_SECRET, cookies.get(COOKIE)?.value);
}
