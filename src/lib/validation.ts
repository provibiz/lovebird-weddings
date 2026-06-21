import { z } from 'zod';

const buttonLink = z
  .string()
  .trim()
  .refine((v) => v === '' || v.startsWith('/') || v.startsWith('https://'), {
    message: 'Link muss mit „/" oder „https://" beginnen.',
  });

const phone = z
  .string()
  .trim()
  .min(6, 'Telefonnummer ist zu kurz.')
  .regex(/^[+0-9 ()/-]+$/, 'Telefonnummer enthält ungültige Zeichen.');

const email = z.string().trim().email('Bitte eine gültige E-Mail-Adresse angeben.');

// ── Per-section schemas (mirror the dashboard forms) ───────────

export const startseiteSchema = z.object({
  hero_title: z.string().trim().min(1, 'Die Hauptüberschrift ist ein Pflichtfeld.'),
  hero_text: z.string().trim().min(1, 'Der Hero-Text darf nicht leer sein.'),
  cta_text: z.string().trim().min(1, 'Der Button-Text darf nicht leer sein.'),
  cta_link: buttonLink,
});

export const seoSchema = z.object({
  slug: z.enum(['index', 'leistungen', 'portfolio', 'brunnenhaus', 'kontakt']),
  seo_title: z
    .string()
    .trim()
    .min(1, 'SEO-Titel ist ein Pflichtfeld.')
    .max(60, 'SEO-Titel darf höchstens 60 Zeichen haben.'),
  seo_description: z
    .string()
    .trim()
    .min(1, 'Meta-Description ist ein Pflichtfeld.')
    .max(160, 'Meta-Description darf höchstens 160 Zeichen haben.'),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(1, 'Titel der Leistung darf nicht leer sein.'),
  description: z.string().trim().min(1, 'Beschreibung darf nicht leer sein.'),
});

export const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, 'Mindestens eine Leistung ist erforderlich.'),
});

export const faqItemSchema = z.object({
  question: z.string().trim().min(1, 'FAQ-Frage darf nicht leer sein.'),
  answer: z.string().trim().min(1, 'FAQ-Antwort darf nicht leer sein.'),
});

export const faqsSchema = z.object({
  faqs: z.array(faqItemSchema),
});

export const kontaktSchema = z.object({
  company_name: z.string().trim().min(1, 'Firmenname ist ein Pflichtfeld.'),
  phone,
  email,
  address: z.string().trim().min(1, 'Standort darf nicht leer sein.'),
  opening_hours: z.string().trim().optional().default(''),
  instagram_url: buttonLink.optional().default(''),
});

export const sectionSchemas = {
  startseite: startseiteSchema,
  seo: seoSchema,
  leistungen: servicesSchema,
  faq: faqsSchema,
  kontakt: kontaktSchema,
} as const;

export type SectionKey = keyof typeof sectionSchemas;
