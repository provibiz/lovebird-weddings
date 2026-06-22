import { fallbackContent } from '@/data/fallback';
import { sanitizeHtml } from '@/lib/sanitize';
import { stockImages } from '@/data/stock-images';
import * as rest from '@/lib/cosmic-rest';
import type { CosmicCreds } from '@/lib/cosmic-rest';
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
// pass those through explicitly.
const env = import.meta.env;

const BUCKET = env.COSMIC_BUCKET_SLUG as string | undefined;
const READ_KEY = env.COSMIC_READ_KEY as string | undefined;
const WRITE_KEY = env.COSMIC_WRITE_KEY as string | undefined;

export function isCosmicConfigured(): boolean {
  return Boolean(BUCKET && READ_KEY);
}

export interface WriteCreds {
  bucketSlug?: string;
  readKey?: string;
  writeKey?: string;
}

function readCreds(): CosmicCreds {
  return { bucketSlug: BUCKET!, readKey: READ_KEY! };
}

/** Resolve full credentials for write operations (runtime env or build env). */
function resolveWriteCreds(creds?: WriteCreds): CosmicCreds {
  const bucketSlug = creds?.bucketSlug ?? BUCKET;
  const readKey = creds?.readKey ?? READ_KEY;
  const writeKey = creds?.writeKey ?? WRITE_KEY;
  if (!bucketSlug || !readKey || !writeKey) {
    throw new Error('Cosmic write credentials are not configured.');
  }
  return { bucketSlug, readKey, writeKey };
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

async function upsertObject(
  creds: CosmicCreds,
  type: string,
  slug: string,
  title: string,
  metadata: Record<string, any>
) {
  const existing = await rest.findOneObject(creds, type, slug, 'id').catch(() => null);
  if (existing?.id) {
    await rest.updateObject(creds, existing.id, { title, metadata });
  } else {
    await rest.createObject(creds, { type, title, slug, metadata });
  }
}

/** Insert only when the object does not yet exist (non-destructive seeding). */
async function insertIfMissing(
  creds: CosmicCreds,
  type: string,
  slug: string,
  title: string,
  metadata: Record<string, any>
): Promise<boolean> {
  const existing = await rest.findOneObject(creds, type, slug, 'id').catch(() => null);
  if (existing?.id) return false;
  await rest.createObject(creds, { type, title, slug, metadata });
  return true;
}

// ── Schema definitions (Cosmic Object Types) ───────────────────
// Image fields are stored as URL strings (text) because the custom dashboard
// uses a picker that yields a URL (local /assets path or Cosmic media URL).
// Array fields (teasers, social_links, benefits) are stored as raw metadata.
const t = (key: string, title: string) => ({ type: 'text', key, title, value: '' });
const ta = (key: string, title: string) => ({ type: 'textarea', key, title, value: '' });
const html = (key: string, title: string) => ({ type: 'html-textarea', key, title, value: '' });

const TYPE_DEFS = [
  {
    title: 'Site Settings', slug: 'site-settings', singular: 'Site Setting', emoji: '⚙️',
    metafields: [
      t('company_name', 'Company Name'), t('phone', 'Phone'), t('phone_href', 'Phone (href)'),
      t('email', 'E-Mail'), t('address', 'Address / Region'), t('opening_hours', 'Opening Hours'),
      t('logo', 'Logo (URL)'), t('default_seo_title', 'Default SEO Title'),
      ta('default_seo_description', 'Default SEO Description'), t('default_og_image', 'Default OG Image (URL)'),
    ],
  },
  {
    title: 'Pages', slug: 'pages', singular: 'Page', emoji: '📄',
    metafields: [
      t('seo_title', 'SEO Title'), ta('seo_description', 'SEO Description'),
      ta('hero_title', 'Hero Title'), html('hero_text', 'Hero Text'), t('hero_image', 'Hero Image (URL)'),
      t('cta_text', 'Button Text'), t('cta_link', 'Button Link'),
      t('about_title', 'About Title'), html('about_text', 'About Text'),
      t('about_image_1', 'About Image 1 (URL)'), t('about_image_2', 'About Image 2 (URL)'),
    ],
  },
  {
    title: 'Services', slug: 'services', singular: 'Service', emoji: '💍',
    metafields: [
      t('title', 'Title'), ta('short_description', 'Short Description'),
      html('description', 'Description'), t('cta_text', 'CTA Text'),
    ],
  },
  {
    title: 'Portfolio', slug: 'portfolio', singular: 'Portfolio Item', emoji: '📸',
    metafields: [t('name', 'Couple / Title'), t('date', 'Date'), t('subtitle', 'Subtitle'), t('image', 'Image (URL)')],
  },
  {
    title: 'FAQs', slug: 'faqs', singular: 'FAQ', emoji: '❓',
    metafields: [t('question', 'Question'), ta('answer', 'Answer')],
  },
  {
    title: 'Testimonials', slug: 'testimonials', singular: 'Testimonial', emoji: '⭐',
    metafields: [t('name', 'Name'), ta('text', 'Text'), { type: 'number', key: 'rating', title: 'Rating', value: 5 }, t('source', 'Source')],
  },
];

/**
 * One-time setup: creates the Object Types (if missing) and seeds them from the
 * bundled fallback content. Existing objects are never overwritten, so it is
 * safe to run again. Returns a summary.
 */
export async function ensureSchemaAndSeed(creds?: WriteCreds) {
  const creds2 = resolveWriteCreds(creds);
  const fb = fallbackContent;

  // 1) Object Types
  const createdTypes: string[] = [];
  const existingSlugs = new Set<string>();
  try {
    for (const ot of await rest.listObjectTypes(creds2)) existingSlugs.add(ot.slug);
  } catch {
    /* ignore – we'll attempt inserts and tolerate failures */
  }
  for (const def of TYPE_DEFS) {
    if (existingSlugs.has(def.slug)) continue;
    try {
      await rest.createObjectType(creds2, def);
      createdTypes.push(def.slug);
    } catch (e: any) {
      // If it already exists (race / pre-created), keep going.
      if (!String(e?.message ?? '').toLowerCase().includes('exist')) throw e;
    }
  }

  // 2) Seed objects (non-destructive)
  const seeded = { 'site-settings': 0, pages: 0, services: 0, portfolio: 0, testimonials: 0 };
  const s = fb.site_settings;
  if (await insertIfMissing(creds2, 'site-settings', 'site-settings', 'Website-Einstellungen', {
    company_name: s.company_name, phone: s.phone, phone_href: s.phone_href, email: s.email,
    address: s.address, opening_hours: s.opening_hours, logo: s.logo ?? '',
    social_links: s.social_links, default_seo_title: s.default_seo_title,
    default_seo_description: s.default_seo_description, default_og_image: s.default_og_image,
  })) seeded['site-settings']++;

  for (const slug of Object.keys(fb.pages)) {
    const p = fb.pages[slug];
    if (await insertIfMissing(creds2, 'pages', slug, p.title, {
      seo_title: p.seo_title, seo_description: p.seo_description,
      hero_title: p.hero_title, hero_text: sanitizeHtml(p.hero_text), hero_image: p.hero_image ?? '',
      cta_text: p.cta_text ?? '', cta_link: p.cta_link ?? '',
      about_title: p.about_title ?? '', about_text: sanitizeHtml(p.about_text ?? ''),
      about_image_1: p.about_image_1 ?? '', about_image_2: p.about_image_2 ?? '',
      teasers: (p.teasers ?? []).map((te) => ({ ...te, text: sanitizeHtml(te.text) })),
    })) seeded.pages++;
  }

  for (const svc of fb.services) {
    if (await insertIfMissing(creds2, 'services', svc.slug, svc.title, {
      title: svc.title, short_description: svc.short_description,
      description: sanitizeHtml(svc.description), benefits: svc.benefits, cta_text: svc.cta_text,
    })) seeded.services++;
  }

  for (let i = 0; i < fb.portfolio.length; i++) {
    const it = fb.portfolio[i];
    if (await insertIfMissing(creds2, 'portfolio', `projekt-${i + 1}`, it.name, {
      name: it.name, date: it.date, subtitle: it.subtitle, image: it.image,
    })) seeded.portfolio++;
  }

  for (let i = 0; i < fb.testimonials.length; i++) {
    const te = fb.testimonials[i];
    if (await insertIfMissing(creds2, 'testimonials', `testi-${i + 1}`, te.name, {
      name: te.name, text: te.text, rating: te.rating, source: te.source,
    })) seeded.testimonials++;
  }

  return { createdTypes, seeded };
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
  const creds2 = resolveWriteCreds(creds);

  switch (section) {
    case 'startseite': {
      await upsertObject(creds2, 'pages', 'index', 'Startseite', {
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
      await upsertObject(creds2, 'pages', data.slug, titleMap[data.slug] ?? data.slug, {
        seo_title: data.seo_title,
        seo_description: data.seo_description,
      });
      break;
    }
    case 'kontakt': {
      const social = data.instagram_url
        ? [{ label: data.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@'), url: data.instagram_url }]
        : [];
      await upsertObject(creds2, 'site-settings', 'site-settings', 'Website-Einstellungen', {
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
        await upsertObject(creds2, 'services', slug, svc.title, {
          title: svc.title,
          description: sanitizeHtml(svc.description),
          short_description: svc.short_description ?? '',
        });
      }
      break;
    }
    case 'faq': {
      const existingObjs = await rest.findObjects(creds2, 'faqs', 'id,slug').catch(() => []);
      const usedSlugs = new Set<string>();
      for (let i = 0; i < data.faqs.length; i++) {
        const f = data.faqs[i];
        const slug = `faq-${i + 1}`;
        usedSlugs.add(slug);
        await upsertObject(creds2, 'faqs', slug, f.question, {
          question: f.question,
          answer: f.answer,
        });
      }
      // remove leftover faqs no longer present
      for (const obj of existingObjs) {
        if (obj.id && obj.slug && !usedSlugs.has(obj.slug)) {
          await rest.deleteObject(creds2, obj.id).catch(() => {});
        }
      }
      break;
    }
    case 'portfolio': {
      const existingObjs = await rest.findObjects(creds2, 'portfolio', 'id,slug').catch(() => []);
      const usedSlugs = new Set<string>();
      for (let i = 0; i < data.items.length; i++) {
        const it = data.items[i];
        const slug = `projekt-${i + 1}`;
        usedSlugs.add(slug);
        await upsertObject(creds2, 'portfolio', slug, it.name, {
          name: it.name,
          date: it.date ?? '',
          subtitle: it.subtitle ?? '',
          image: it.image ?? '',
        });
      }
      for (const obj of existingObjs) {
        if (obj.id && obj.slug && !usedSlugs.has(obj.slug)) {
          await rest.deleteObject(creds2, obj.id).catch(() => {});
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
    const media = await rest.listMediaRest(readCreds(), 100);
    const uploaded: MediaItem[] = media.map((m) => ({
      id: m.id ?? m.name ?? '',
      name: m.original_name ?? m.name ?? '',
      url: m.imgix_url ?? m.url ?? '',
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
  const m = await rest.uploadMediaRest(resolveWriteCreds(creds), file);
  return {
    id: m.id ?? m.name ?? '',
    name: m.original_name ?? m.name ?? '',
    url: m.imgix_url ?? m.url ?? '',
    stock: false,
  };
}

export async function deleteMedia(id: string, creds?: WriteCreds): Promise<void> {
  const c = resolveWriteCreds(creds);
  // Cosmic deletes media by file name; resolve id → name if needed.
  let name = id;
  try {
    const found = (await rest.listMediaRest(c, 100)).find((m) => m.id === id || m.name === id);
    if (found?.name) name = found.name;
  } catch {
    /* fall back to the given id */
  }
  await rest.deleteMediaRest(c, name);
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
    const creds = readCreds();
    const [settingsList, services, faqs, testimonials, pages, portfolio] = await Promise.all([
      rest.findObjects(creds, 'site-settings', 'slug,title,metadata', 1).catch(() => []),
      rest.findObjects(creds, 'services', 'slug,title,metadata').catch(() => []),
      rest.findObjects(creds, 'faqs', 'slug,title,metadata').catch(() => []),
      rest.findObjects(creds, 'testimonials', 'slug,title,metadata').catch(() => []),
      rest.findObjects(creds, 'pages', 'slug,title,metadata').catch(() => []),
      rest.findObjects(creds, 'portfolio', 'slug,title,metadata').catch(() => []),
    ]);
    const settings = settingsList[0] ?? null;

    const pageList: CosmicObject[] = pages ?? [];
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

    const serviceList: CosmicObject[] = services ?? [];
    const faqList: CosmicObject[] = faqs ?? [];
    const testimonialList: CosmicObject[] = testimonials ?? [];
    const portfolioList: CosmicObject[] = portfolio ?? [];

    cache = {
      site_settings: mapSettings(settings ?? undefined),
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
