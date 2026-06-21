// Content model shared by the public site, the Cosmic helpers and the dashboard.
// Mirrors the Cosmic Object Types documented in the README.

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  company_name: string;
  phone: string;
  phone_href: string;
  email: string;
  address: string;
  opening_hours: string;
  logo?: string;
  social_links: SocialLink[];
  default_seo_title: string;
  default_seo_description: string;
  default_og_image: string;
}

export interface Service {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  benefits: string[];
  cta_text: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  source: string;
}

export interface PageContent {
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  hero_title: string;
  hero_text: string;
  hero_image?: string;
}

export interface SiteContent {
  site_settings: SiteSettings;
  pages: Record<string, PageContent>;
  services: Service[];
  faqs: Faq[];
  testimonials: Testimonial[];
}
