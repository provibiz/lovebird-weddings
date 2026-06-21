import { fallbackContent } from '@/data/fallback';
import { sanitizeHtml } from '@/lib/sanitize';
import { stockImages } from '@/data/stock-images';
import type {
  SiteContent,
  SiteSettings,
  Service,
  Faq,
  Testimonial,
  PageContent,
  PortfolioItem,
  MediaItem,
} from '@/lib/types';

// ── Environment ────────────────────────────────────────────────
// In Astro, build-time secrets live on `import.meta.env`. On Cloudflare
// runtime they arrive via the request `locals.runtime.env`; the API routes
// pass those through to the write client explicitly.
const env = import.meta.env;

const BUCKET = env.COSMIC_BUCKET_SLUG as string | undefined;
const READ_KEY = env.COSMIC_READ_KEY as string | undefined;
const WRITE_KEY = env.COSMIC_WRITE_KEY as string | undefined;

export function isCosmicConfigured(): boolean {
  return Boolean(BUCKET && READ_KEY);
}

// The Cosmic SDK references browser globals at import time, so it is loaded
// dynamically — never during the static prerender of the public pages.
async function createBucketClient(
  config: { bucketSlug: string; readKey: string; writeKey?: string }
) {
  const sdk = await import('@cosmicjs/sdk');
  return sdk.createBucketClient(config);
}

async function readClient() {
  return createBucketClient({ bucketSlug: BUCKET!, readKey: READ_KEY! });
}

/**
 * Write client. Only ever instantiated inside server-side /api routes.
 * Credentials may be passed in from the Cloudflare runtime env.
 */
export async function writeClient(creds?: {
  bucketSlug?: string;
  readKey?: string;
  writeKey?: string;
}) {
  const bucketSlug = creds?.bucketSlug ?? BUCKET;
  const readKey = creds?.readKey ?? READ_KEY;
  const writeKey = creds?.writeKey ?? WRITE_KEY;
  if (!bucketSlug || !readKey || !writeKey) {
    throw new Error('Cosmic write credentials are not configured.');
  }
  return createBucketClient({ bucketSlug, readKey, writeKey });
}

// ── Mapping helpers (Cosmic object metadata → typed content) ───
type CosmicObject = { slug?: string; title?: string; metadata?: Record<string, any> };

function mapSettings(obj: CosmicObject | undefined): SiteSettings {
  const m = obj?.metadata ?? {};
  const fb = fallbackContent.site_settings;
  return {
    company_name: m.company_name ?? fb.company_name,
    phone: m.phone ?? fb.phone,
    phone_href: m.phone_href ?? (m.phone ? m.phone.replace(/[^+\d]/g, '') : fb.phone_href),
    email: m.email ?? fb.email,
    address: m.address ?? fb.address,
    opening_hours: m.opening_hours ?? fb.opening_hours,
    logo: m.logo?.url ?? m.logo ?? fb.logo,
    social_links: Array.isArray(m.social_links) ? m.social_links : fb.social_links,
    default_seo_title: m.default_seo_title ?? fb.default_seo_title,
    default_seo_description: m.default_seo_description ?? fb.default_seo_description,
    default_og_image: m.default_og_image?.url ?? m.default_og_image ?? fb.default_og_image,
  };
}

function mapService(obj: CosmicObject): Service {
  const m = obj.metadata ?? {};
  return {
    title: obj.title ?? m.title ?? '',
    slug: obj.slug ?? m.slug ?? '',
    short_description: m.short_description ?? '',
    description: m.description ?? '',
    benefits: Array.isArray(m.benefits) ? m.benefits : [],
    cta_text: m.cta_text ?? 'Mehr erfahren',
  };
}

function mapFaq(obj: CosmicObject): Faq {
  const m = obj.metadata ?? {};
  return { question: m.question ?? obj.title ?? '', answer: m.answer ?? '' };
}

function mapTestimonial(obj: CosmicObject): Testimonial {
  const m = obj.metadata ?? {};
  return {
    name: m.name ?? obj.title ?? '',
    text: m.text ?? '',
    rating: Number(m.rating ?? 5),
    source: m.source ?? '',
  };
}

function img(v: any): string | undefined {
  return v?.url ?? v ?? undefined;
}

function mapPage(obj: CosmicObject): PageContent {
  const m = obj.metadata ?? {};
  return {
    title: obj.title ?? '',
    slug: obj.slug ?? '',
    seo_title: m.seo_title ?? '',
    seo_description: m.seo_description ?? '',
    hero_title: m.hero_title ?? '',
    hero_text: m.hero_text ?? '',
    hero_image: img(m.hero_image),
    cta_text: m.cta_text ?? undefined,
    cta_link: m.cta_link ?? undefined,
    about_title: m.about_title ?? undefined,
    about_text: m.about_text ?? undefined,
    about_image_1: img(m.about_image_1),
    about_image_2: img(m.about_image_2),
    teasers: Array.isArray(m.teasers)
      ? m.teasers.map((t: any) => ({
          num: t.num ?? '',
          title: t.title ?? '',
          text: t.text ?? '',
          image: img(t.image) ?? '',
        }))
      : undefined,
  };
}

function mapPortfolioItem(obj: CosmicObject): PortfolioItem {
  const m = obj.metadata ?? {};
  return {
    slug: obj.slug ?? '',
    date: m.date ?? '',
    name: m.name ?? obj.title ?? '',
    subtitle: m.subtitle ?? '',
    image: img(m.image) ?? '',
  };
}

// ── Write API (server-side only, called from /api routes) ──────
interface WriteCreds {
  bucketSlug?: string;
  readKey?: string;
  writeKey?: string;
}

async function upsertObject(
  client: any,
  type: string,
  slug: string,
  title: string,
  metadata: Record<string, any>
) {
  const existing = await client.objects
    .findOne({ type, slug })
    .props('id')
    .catch(() => null);
  const id = (existing as any)?.object?.id;
  if (id) {
    await client.objects.updateOne(id, { title, metadata });
  } else {
    await client.objects.insertOne({ type, title, slug, metadata });
  }
}

/**
 * Persists one dashboard section to Cosmic. `data` is already Zod-validated.
 * Returns the slugs touched (for messaging). Throws on Cosmic errors.
 */
export async function persistSection(
  section: string,
  data: any,
  creds?: WriteCreds
): Promise<void> {
  const client = await writeClient(creds);

  switch (section) {
    case 'startseite': {
      await upsertObject(client, 'pages', 'index', 'Startseite', {
        hero_title: data.hero_title,
        hero_text: sanitizeHtml(data.hero_text),
        cta_text: data.cta_text,
        cta_link: data.cta_link,
        hero_image: data.hero_image,
        about_title: data.about_title,
        about_text: sanitizeHtml(data.about_text),
        about_image_1: data.about_image_1,
        about_image_2: data.about_image_2,
        teasers: (data.teasers ?? []).map((t: any) => ({
          num: t.num ?? '',
          title: t.title ?? '',
          text: sanitizeHtml(t.text ?? ''),
          image: t.image ?? '',
        })),
      });
      break;
    }
    case 'seo': {
      const titleMap: Record<string, string> = {
        index: 'Startseite',
        leistungen: 'Leistungen',
        portfolio: 'Portfolio',
        brunnenhaus: 'Brunnenhaus',
        kontakt: 'Kontakt',
      };
      await upsertObject(client, 'pages', data.slug, titleMap[data.slug] ?? data.slug, {
        seo_title: data.seo_title,
        seo_description: data.seo_description,
      });
      break;
    }
    case 'kontakt': {
      const social = data.instagram_url
        ? [{ label: data.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@'), url: data.instagram_url }]
        : [];
      await upsertObject(client, 'site_settings', 'site-settings', 'Website-Einstellungen', {
        company_name: data.company_name,
        phone: data.phone,
        phone_href: data.phone.replace(/[^+\d]/g, ''),
        email: data.email,
        address: data.address,
        opening_hours: data.opening_hours ?? '',
        social_links: social,
      });
      break;
    }
    case 'leistungen': {
      const slugify = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      for (const svc of data.services) {
        const slug = slugify(svc.title);
        await upsertObject(client, 'services', slug, svc.title, {
          title: svc.title,
          description: sanitizeHtml(svc.description),
          short_description: svc.short_description ?? '',
        });
      }
      break;
    }
    case 'faq': {
      const existing = await client.objects
        .find({ type: 'faqs' })
        .props('id,slug')
        .catch(() => ({ objects: [] }));
      const existingObjs: Array<{ id: string; slug: string }> = (existing as any)?.objects ?? [];
      const usedSlugs = new Set<string>();
      for (let i = 0; i < data.faqs.length; i++) {
        const f = data.faqs[i];
        const slug = `faq-${i + 1}`;
        usedSlugs.add(slug);
        await upsertObject(client, 'faqs', slug, f.question, {
          question: f.question,
          answer: f.answer,
        });
      }
      // remove leftover faqs no longer present
      for (const obj of existingObjs) {
        if (!usedSlugs.has(obj.slug)) {
          await client.objects.deleteOne(obj.id).catch(() => {});
        }
      }
      break;
    }
    case 'portfolio': {
      const existing = await client.objects
        .find({ type: 'portfolio' })
        .props('id,slug')
        .catch(() => ({ objects: [] }));
      const existingObjs: Array<{ id: string; slug: string }> = (existing as any)?.objects ?? [];
      const usedSlugs = new Set<string>();
      for (let i = 0; i < data.items.length; i++) {
        const it = data.items[i];
        const slug = `projekt-${i + 1}`;
        usedSlugs.add(slug);
        await upsertObject(client, 'portfolio', slug, it.name, {
          name: it.name,
          date: it.date ?? '',
          subtitle: it.subtitle ?? '',
          image: it.image ?? '',
        });
      }
      for (const obj of existingObjs) {
        if (!usedSlugs.has(obj.slug)) {
          await client.objects.deleteOne(obj.id).catch(() => {});
        }
      }
      break;
    }
    default:
      throw new Error(`Unbekannter Bereich: ${section}`);
  }
}

// ── Media library (Cosmic Media API, server-side only) ─────────

/** Lists stock images (bundled) + Cosmic media (uploaded). */
export async function listMedia(creds?: WriteCreds): Promise<MediaItem[]> {
  const stock: MediaItem[] = stockImages.map((url) => ({
    id: url,
    name: url.split('/').pop() ?? url,
    url,
    stock: true,
  }));

  if (!isCosmicConfigured()) return stock;
  try {
    const c = await readClient();
    const res = await c.media.find({}).props('id,name,url,imgix_url').limit(100).catch(() => null);
    const uploaded: MediaItem[] = ((res as any)?.media ?? []).map((m: any) => ({
      id: m.id ?? m.name,
      name: m.original_name ?? m.name,
      url: m.imgix_url ?? m.url,
      stock: false,
    }));
    return [...uploaded, ...stock];
  } catch {
    return stock;
  }
}

export async function uploadMedia(
  file: { buffer: ArrayBuffer; name: string; type: string },
  creds?: WriteCreds
): Promise<MediaItem> {
  const client = await writeClient(creds);
  const media_object = {
    originalname: file.name,
    buffer: new Uint8Array(file.buffer),
    type: file.type,
  };
  const res = await client.media.insertOne({ media: media_object as any });
  const m = (res as any)?.media ?? {};
  return { id: m.id ?? m.name, name: m.original_name ?? m.name, url: m.imgix_url ?? m.url, stock: false };
}

export async function deleteMedia(id: string, creds?: WriteCreds): Promise<void> {
  const client = await writeClient(creds);
  // Cosmic deletes media by file name; resolve id → name if needed.
  let name = id;
  try {
    const c = await readClient();
    const res = await c.media.find({}).props('id,name').limit(100).catch(() => null);
    const found = ((res as any)?.media ?? []).find((m: any) => m.id === id || m.name === id);
    if (found) name = found.name;
  } catch {
    /* fall back to the given id */
  }
  await client.media.deleteOne(name);
}

/** Optionally trigger a Cloudflare Pages rebuild via a Deploy Hook. */
export async function triggerCloudflareDeploy(hookUrl?: string): Promise<boolean> {
  if (!hookUrl) return false;
  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Public read API ────────────────────────────────────────────
let cache: SiteContent | null = null;

/**
 * Returns the full site content. Reads from Cosmic when configured,
 * otherwise (or on any error) returns the bundled local fallback so the
 * static site always builds.
 */
export async function getContent(): Promise<SiteContent> {
  if (cache) return cache;
  if (!isCosmicConfigured()) {
    cache = fallbackContent;
    return cache;
  }

  try {
    const c = await readClient();
    const [settings, services, faqs, testimonials, pages, portfolio] = await Promise.all([
      c.objects.findOne({ type: 'site_settings' }).props('slug,title,metadata').catch(() => null),
      c.objects.find({ type: 'services' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'faqs' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'testimonials' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'pages' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'portfolio' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
    ]);

    const pageList: CosmicObject[] = (pages as any)?.objects ?? [];
    const pageMap: Record<string, PageContent> = { ...fallbackContent.pages };
    for (const p of pageList) {
      const mapped = mapPage(p);
      if (!mapped.slug) continue;
      // Only override fallback with keys that Cosmic actually provided, so a
      // page edited via the dashboard (e.g. only hero fields) keeps the rest.
      const defined: Record<string, any> = {};
      for (const [k, v] of Object.entries(mapped)) if (v !== undefined) defined[k] = v;
      pageMap[mapped.slug] = { ...fallbackContent.pages[mapped.slug], ...defined } as PageContent;
    }

    const serviceList: CosmicObject[] = (services as any)?.objects ?? [];
    const faqList: CosmicObject[] = (faqs as any)?.objects ?? [];
    const testimonialList: CosmicObject[] = (testimonials as any)?.objects ?? [];
    const portfolioList: CosmicObject[] = (portfolio as any)?.objects ?? [];

    cache = {
      site_settings: mapSettings((settings as any)?.object),
      pages: pageMap,
      services: serviceList.length ? serviceList.map(mapService) : fallbackContent.services,
      faqs: faqList.length ? faqList.map(mapFaq) : fallbackContent.faqs,
      testimonials: testimonialList.length
        ? testimonialList.map(mapTestimonial)
        : fallbackContent.testimonials,
      portfolio: portfolioList.length
        ? portfolioList.map(mapPortfolioItem)
        : fallbackContent.portfolio,
    };
    return cache;
  } catch {
    cache = fallbackContent;
    return cache;
  }
}
