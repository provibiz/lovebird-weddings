import type { APIRoute } from 'astro';
import { getEnv } from '@/lib/auth';
import { listMedia, uploadMedia, deleteMedia } from '@/lib/cosmic';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function creds(locals: any) {
  const env = getEnv(locals);
  return {
    bucketSlug: env.COSMIC_BUCKET_SLUG,
    readKey: env.COSMIC_READ_KEY,
    writeKey: env.COSMIC_WRITE_KEY,
  };
}

// List stock + uploaded media (auth enforced by middleware).
export const GET: APIRoute = async ({ locals }) => {
  try {
    const items = await listMedia(creds(locals));
    return json({ ok: true, items });
  } catch {
    return json({ ok: false, error: 'Medien konnten nicht geladen werden.' }, 500);
  }
};

// Upload a new image to Cosmic media.
export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);
  if (!env.COSMIC_WRITE_KEY || !env.COSMIC_BUCKET_SLUG) {
    return json({ ok: false, error: 'Cosmic ist nicht konfiguriert – Upload nicht möglich.' }, 503);
  }
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return json({ ok: false, error: 'Keine Datei erhalten.' }, 400);
    }
    if (!file.type.startsWith('image/')) {
      return json({ ok: false, error: 'Nur Bilddateien sind erlaubt.' }, 422);
    }
    if (file.size > 8 * 1024 * 1024) {
      return json({ ok: false, error: 'Die Datei ist zu groß (max. 8 MB).' }, 422);
    }
    const item = await uploadMedia(
      { buffer: await file.arrayBuffer(), name: file.name, type: file.type },
      creds(locals)
    );
    return json({ ok: true, item });
  } catch {
    return json({ ok: false, error: 'Upload fehlgeschlagen.' }, 502);
  }
};

// Delete an uploaded image (stock images are not deletable).
export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);
  if (!env.COSMIC_WRITE_KEY || !env.COSMIC_BUCKET_SLUG) {
    return json({ ok: false, error: 'Cosmic ist nicht konfiguriert.' }, 503);
  }
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return json({ ok: false, error: 'Keine ID angegeben.' }, 400);
    await deleteMedia(id, creds(locals));
    return json({ ok: true });
  } catch (err: any) {
    return json({ ok: false, error: `Löschen fehlgeschlagen: ${err?.message ?? 'unbekannt'}` }, 502);
  }
};
