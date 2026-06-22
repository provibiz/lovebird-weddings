import type { APIRoute } from 'astro';
import { getEnv } from '@/lib/auth';
import { ensureSchemaAndSeed } from '@/lib/cosmic';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

// One-time Cosmic setup, split into steps to stay under the Cloudflare
// subrequest limit (auth via middleware). step: 'schema' | 'content'.
export const POST: APIRoute = async ({ locals, request }) => {
  const env = getEnv(locals);
  if (!env.COSMIC_WRITE_KEY || !env.COSMIC_BUCKET_SLUG) {
    return json({ ok: false, error: 'Cosmic ist nicht konfiguriert (COSMIC_* fehlen).' }, 503);
  }
  let step: 'schema' | 'content' = 'schema';
  try {
    const body = (await request.json().catch(() => ({}))) as { step?: string };
    if (body.step === 'content') step = 'content';
  } catch {
    /* default schema */
  }

  try {
    const result = await ensureSchemaAndSeed(
      {
        bucketSlug: env.COSMIC_BUCKET_SLUG,
        readKey: env.COSMIC_READ_KEY,
        writeKey: env.COSMIC_WRITE_KEY,
      },
      step
    );
    return json({ ok: true, ...result });
  } catch (err: any) {
    return json(
      { ok: false, error: `Setup (${step}) fehlgeschlagen: ${err?.message ?? 'unbekannter Fehler'}` },
      502
    );
  }
};
