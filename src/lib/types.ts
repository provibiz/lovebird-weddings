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

export interface HomeTeaser {
  num: string;
  title: string;
  text: string; // rich text (sanitized HTML)
  image: string;
}

export interface PageContent {
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  hero_title: string;
  hero_text: string; // rich text (sanitized HTML)
  hero_image?: string;
  /** Primary hero button (home page). */
  cta_text?: string;
  cta_link?: string;
  /** Home page only: "Über mich" + service teasers. */
  about_title?: string;
  about_text?: string; // rich text (sanitized HTML)
  about_image_1?: string;
  about_image_2?: string;
  teasers?: HomeTeaser[];
}

export interface PortfolioItem {
  slug: string;
  date: string;
  name: string;
  subtitle: string;
  image: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  /** True for bundled stock images (cannot be deleted). */
  stock: boolean;
}

export interface SiteContent {
  site_settings: SiteSettings;
  pages: Record<string, PageContent>;
  services: Service[];
  faqs: Faq[];
  testimonials: Testimonial[];
  portfolio: PortfolioItem[];
}
