// Native fetch client for the Cosmic REST API.
// The official @cosmicjs/sdk uses axios, whose Node adapter does not work on
// the Cloudflare Workers runtime (writes fail). Workers support fetch +
// FormData natively, so we talk to the REST API directly.

const API = 'https://api.cosmicjs.com/v3';
const UPLOAD = 'https://workers.cosmicjs.com/v3';

export interface CosmicCreds {
  bucketSlug: string;
  readKey: string;
  writeKey?: string;
}

export interface CosmicObjectRecord {
  id?: string;
  slug?: string;
  title?: string;
  metadata?: Record<string, any>;
}

function bucketUrl(creds: CosmicCreds, path: string): string {
  return `${API}/buckets/${creds.bucketSlug}${path}`;
}

async function readJson(res: Response, ctx: string): Promise<any> {
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`Cosmic ${ctx} → ${res.status} ${res.statusText}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

// ── Reads ──────────────────────────────────────────────────────
export async function findObjects(
  creds: CosmicCreds,
  type: string,
  props = 'id,slug,title,metadata',
  limit = 100
): Promise<CosmicObjectRecord[]> {
  const url = new URL(bucketUrl(creds, '/objects'));
  url.searchParams.set('read_key', creds.readKey);
  url.searchParams.set('query', JSON.stringify({ type }));
  url.searchParams.set('props', props);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (res.status === 404) return []; // no objects of this type yet
  const data = await readJson(res, `GET objects(${type})`);
  return data.objects ?? [];
}

export async function findOneObject(
  creds: CosmicCreds,
  type: string,
  slug: string,
  props = 'id'
): Promise<CosmicObjectRecord | null> {
  const url = new URL(bucketUrl(creds, '/objects'));
  url.searchParams.set('read_key', creds.readKey);
  url.searchParams.set('query', JSON.stringify({ type, slug }));
  url.searchParams.set('props', props);
  url.searchParams.set('limit', '1');
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (res.status === 404) return null;
  const data = await readJson(res, `GET object(${type}/${slug})`);
  return data.objects?.[0] ?? null;
}

// ── Writes (Bearer write key) ──────────────────────────────────
function writeHeaders(creds: CosmicCreds): Record<string, string> {
  if (!creds.writeKey) throw new Error('Cosmic write key missing.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${creds.writeKey}` };
}

export async function createObject(
  creds: CosmicCreds,
  obj: { type: string; title: string; slug?: string; metadata: Record<string, any> }
): Promise<void> {
  const res = await fetch(bucketUrl(creds, '/objects'), {
    method: 'POST',
    headers: writeHeaders(creds),
    body: JSON.stringify(obj),
  });
  await readJson(res, `POST object(${obj.type})`);
}

export async function updateObject(
  creds: CosmicCreds,
  id: string,
  patch: { title?: string; metadata?: Record<string, any> }
): Promise<void> {
  const res = await fetch(bucketUrl(creds, `/objects/${id}`), {
    method: 'PATCH',
    headers: writeHeaders(creds),
    body: JSON.stringify(patch),
  });
  await readJson(res, `PATCH object(${id})`);
}

export async function deleteObject(creds: CosmicCreds, id: string): Promise<void> {
  const res = await fetch(bucketUrl(creds, `/objects/${id}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${creds.writeKey}` },
  });
  await readJson(res, `DELETE object(${id})`);
}

// ── Object Types ───────────────────────────────────────────────
export async function listObjectTypes(creds: CosmicCreds): Promise<Array<{ slug: string }>> {
  const url = new URL(bucketUrl(creds, '/object-types'));
  url.searchParams.set('read_key', creds.readKey);
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (res.status === 404) return [];
  const data = await readJson(res, 'GET object-types');
  return data.object_types ?? [];
}

export async function createObjectType(creds: CosmicCreds, def: any): Promise<void> {
  const res = await fetch(bucketUrl(creds, '/object-types'), {
    method: 'POST',
    headers: writeHeaders(creds),
    body: JSON.stringify(def),
  });
  await readJson(res, `POST object-type(${def.slug})`);
}

/** Update an existing object type (e.g. to add/refresh metafields). */
export async function updateObjectType(creds: CosmicCreds, slug: string, def: any): Promise<void> {
  const res = await fetch(bucketUrl(creds, `/object-types/${slug}`), {
    method: 'PATCH',
    headers: writeHeaders(creds),
    body: JSON.stringify(def),
  });
  await readJson(res, `PATCH object-type(${slug})`);
}

// ── Media ──────────────────────────────────────────────────────
export interface CosmicMedia {
  id?: string;
  name?: string;
  original_name?: string;
  url?: string;
  imgix_url?: string;
}

export async function listMediaRest(creds: CosmicCreds, limit = 100): Promise<CosmicMedia[]> {
  const url = new URL(bucketUrl(creds, '/media'));
  url.searchParams.set('read_key', creds.readKey);
  url.searchParams.set('props', 'id,name,original_name,url,imgix_url');
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (res.status === 404) return [];
  const data = await readJson(res, 'GET media');
  return data.media ?? [];
}

export async function uploadMediaRest(
  creds: CosmicCreds,
  file: { buffer: ArrayBuffer; name: string; type: string }
): Promise<CosmicMedia> {
  const fd = new FormData();
  fd.append('media', new Blob([file.buffer], { type: file.type }), file.name);
  if (creds.writeKey) fd.append('write_key', creds.writeKey);
  const res = await fetch(`${UPLOAD}/buckets/${creds.bucketSlug}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${creds.writeKey}` },
    body: fd,
  });
  const data = await readJson(res, 'POST media');
  return data.media ?? {};
}

export async function deleteMediaRest(creds: CosmicCreds, name: string): Promise<void> {
  const res = await fetch(bucketUrl(creds, `/media/${encodeURIComponent(name)}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${creds.writeKey}` },
  });
  await readJson(res, `DELETE media(${name})`);
}
