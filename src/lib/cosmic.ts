import { fallbackContent } from '@/data/fallback';
import type {
  SiteContent,
  SiteSettings,
  Service,
  Faq,
  Testimonial,
  PageContent,
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

function mapPage(obj: CosmicObject): PageContent {
  const m = obj.metadata ?? {};
  return {
    title: obj.title ?? '',
    slug: obj.slug ?? '',
    seo_title: m.seo_title ?? '',
    seo_description: m.seo_description ?? '',
    hero_title: m.hero_title ?? '',
    hero_text: m.hero_text ?? '',
    hero_image: m.hero_image?.url ?? m.hero_image ?? undefined,
  };
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
    const [settings, services, faqs, testimonials, pages] = await Promise.all([
      c.objects.findOne({ type: 'site_settings' }).props('slug,title,metadata').catch(() => null),
      c.objects.find({ type: 'services' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'faqs' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'testimonials' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
      c.objects.find({ type: 'pages' }).props('slug,title,metadata').catch(() => ({ objects: [] })),
    ]);

    const pageList: CosmicObject[] = (pages as any)?.objects ?? [];
    const pageMap: Record<string, PageContent> = { ...fallbackContent.pages };
    for (const p of pageList) {
      const mapped = mapPage(p);
      if (mapped.slug) pageMap[mapped.slug] = { ...fallbackContent.pages[mapped.slug], ...mapped };
    }

    const serviceList: CosmicObject[] = (services as any)?.objects ?? [];
    const faqList: CosmicObject[] = (faqs as any)?.objects ?? [];
    const testimonialList: CosmicObject[] = (testimonials as any)?.objects ?? [];

    cache = {
      site_settings: mapSettings((settings as any)?.object),
      pages: pageMap,
      services: serviceList.length ? serviceList.map(mapService) : fallbackContent.services,
      faqs: faqList.length ? faqList.map(mapFaq) : fallbackContent.faqs,
      testimonials: testimonialList.length
        ? testimonialList.map(mapTestimonial)
        : fallbackContent.testimonials,
    };
    return cache;
  } catch {
    cache = fallbackContent;
    return cache;
  }
}
