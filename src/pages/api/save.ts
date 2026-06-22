import type { APIRoute } from 'astro';
import { getEnv } from '@/lib/auth';
import { sectionSchemas, type SectionKey } from '@/lib/validation';
import { persistSection, triggerCloudflareDeploy } from '@/lib/cosmic';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  // (auth is enforced by middleware)
  let payload: { section?: string; data?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Ungültige Anfrage.' }, 400);
  }

  const section = payload.section as SectionKey;
  const schema = sectionSchemas[section];
  if (!schema) {
    return json({ ok: false, error: 'Unbekannter Bereich.' }, 400);
  }

  const parsed = schema.safeParse(payload.data);
  if (!parsed.success) {
    // Flatten Zod errors into field → message
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.') || '_'] = issue.message;
    }
    return json({ ok: false, error: 'Bitte Eingaben prüfen.', fieldErrors }, 422);
  }

  const env = getEnv(locals);
  if (!env.COSMIC_WRITE_KEY || !env.COSMIC_BUCKET_SLUG) {
    return json(
      {
        ok: false,
        error:
          'Cosmic ist noch nicht konfiguriert. Die Eingaben sind gültig, konnten aber nicht gespeichert werden.',
      },
      503
    );
  }

  try {
    await persistSection(section, parsed.data, {
      bucketSlug: env.COSMIC_BUCKET_SLUG,
      readKey: env.COSMIC_READ_KEY,
      writeKey: env.COSMIC_WRITE_KEY,
    });
  } catch (err: any) {
    return json(
      { ok: false, error: `Speichern bei Cosmic fehlgeschlagen: ${err?.message ?? 'unbekannter Fehler'}` },
      502
    );
  }

  const deployed = await triggerCloudflareDeploy(env.CLOUDFLARE_DEPLOY_HOOK_URL);
  return json({
    ok: true,
    message: deployed
      ? 'Gespeichert. Die Website wird neu veröffentlicht (ca. 1–2 Minuten).'
      : 'Gespeichert.',
  });
};
