import type { APIRoute } from 'astro';
import { getEnv } from '@/lib/auth';
import { ensureSchemaAndSeed } from '@/lib/cosmic';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

// One-time Cosmic setup: create Object Types + seed content (auth via middleware).
export const POST: APIRoute = async ({ locals }) => {
  const env = getEnv(locals);
  if (!env.COSMIC_WRITE_KEY || !env.COSMIC_BUCKET_SLUG) {
    return json({ ok: false, error: 'Cosmic ist nicht konfiguriert (COSMIC_* fehlen).' }, 503);
  }
  try {
    const result = await ensureSchemaAndSeed({
      bucketSlug: env.COSMIC_BUCKET_SLUG,
      readKey: env.COSMIC_READ_KEY,
      writeKey: env.COSMIC_WRITE_KEY,
    });
    const types = result.createdTypes.length
      ? `Object Types angelegt: ${result.createdTypes.join(', ')}. `
      : 'Alle Object Types waren bereits vorhanden. ';
    const seededCount = Object.values(result.seeded).reduce((a, b) => a + b, 0);
    return json({
      ok: true,
      message: `${types}${seededCount} Inhalte angelegt (${JSON.stringify(result.seeded)}).`,
    });
  } catch (err: any) {
    return json(
      { ok: false, error: `Setup fehlgeschlagen: ${err?.message ?? 'unbekannter Fehler'}` },
      502
    );
  }
};
