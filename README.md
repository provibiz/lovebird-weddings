# Lovebird Weddings — Website

Statische Astro-Website für **Lovebird Weddings & Events** (Sarah Pohl,
Hochzeitsplanung zwischen Halle/Saale und Leipzig). Öffentliche Seiten werden
statisch ausgeliefert; ein schlankes, serverseitiges Kunden-Dashboard pflegt
die Inhalte über **Cosmic JS**. Deployment-Ziel ist **Cloudflare Pages**.

## Tech-Stack

- **Astro** (statisches Output, SSR-Insel nur für Dashboard/API)
- **@astrojs/cloudflare** (Adapter) · **@astrojs/sitemap**
- **Cosmic JS** als Headless-CMS (mit lokalem Fallback)
- **Zod** für Eingabe-Validierung im Dashboard
- Kein UI-Framework, keine Hydration-Inseln, ein zentrales CSS

## Projektstruktur

```
src/
  layouts/      BaseLayout (öffentlich), DashboardLayout (Admin)
  components/   Header, Footer, Hero, ServicesSection, … (siehe Ordner)
  pages/        index, leistungen, portfolio, brunnenhaus, kontakt,
                impressum, datenschutz        ← statisch (prerender)
  pages/dashboard/  Login + Pflege-Seiten     ← SSR (prerender = false)
  pages/api/    login, logout, save           ← SSR
  lib/          cosmic.ts (read/write), auth.ts, validation.ts, types.ts
  data/         fallback.ts (Inhalte, wenn Cosmic nicht verbunden ist)
  styles/       global.css (öffentlich), dashboard.css (Admin)
  middleware.ts schützt /dashboard und /api
public/assets/images/  alle Bilder (lokal, kein Hotlinking)
```

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # Werte eintragen (siehe unten)
npm run dev            # http://localhost:4321
npm run build          # Produktionsbuild nach dist/
npm run preview        # Build lokal vorschauen
```

Ohne `.env`/Cosmic läuft die Seite vollständig mit den lokalen Fallback-Inhalten
aus `src/data/fallback.ts`.

## Umgebungsvariablen

| Variable | Zweck |
|---|---|
| `COSMIC_BUCKET_SLUG` | Cosmic Bucket |
| `COSMIC_READ_KEY` | Lesen (Build/öffentliche Seite) |
| `COSMIC_WRITE_KEY` | Schreiben – **nur serverseitig** in `/api` |
| `CLOUDFLARE_DEPLOY_HOOK_URL` | optional: Rebuild nach Speichern auslösen |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Dashboard-Login |
| `SESSION_SECRET` | signiert das Session-Cookie (langer Zufallswert) |

Der `COSMIC_WRITE_KEY` wird niemals an den Browser ausgeliefert – Schreibzugriffe
laufen ausschließlich über die serverseitige Route `POST /api/save`.

## Cosmic-Inhaltsmodell

Object Types im Cosmic-Bucket (Metadata-Felder):

- **site_settings** (Singleton, slug `site-settings`): `company_name`, `phone`,
  `phone_href`, `email`, `address`, `opening_hours`, `logo`, `social_links`,
  `default_seo_title`, `default_seo_description`, `default_og_image`
- **pages** (slug = `index|leistungen|portfolio|brunnenhaus|kontakt`):
  `seo_title`, `seo_description`, `hero_title`, `hero_text`, `hero_image`,
  `cta_text`, `cta_link`
- **services**: `title`, `short_description`, `description`, `benefits`, `cta_text`
- **faqs**: `question`, `answer`
- **testimonials**: `name`, `text`, `rating`, `source`

Solange ein Type leer/nicht vorhanden ist, greift automatisch der Fallback.

## Kunden-Dashboard

Erreichbar unter `/dashboard` (Login `/dashboard/login`). Bearbeitbar:

- **Startseite** – Hero-Überschrift, Text, Button-Text/-Link
- **Leistungen** – Titel & Beschreibungen (hinzufügen/entfernen)
- **FAQ** – Fragen & Antworten
- **Kontaktdaten** – Firma, Telefon, E-Mail, Standort, Instagram
- **SEO** – Seitentitel (≤ 60) & Meta-Beschreibung (≤ 160) je Seite

Bewusst **nicht** editierbar: Layout, Farben, Schriftarten, Komponentenstruktur,
CSS, Canonical, Robots, Schema.org und sonstige technische Einstellungen.

Validierung (Zod, server- und clientseitig): Pflichtfeld Hauptüberschrift,
Button-Link beginnt mit `/` oder `https://`, SEO-Titel ≤ 60, Meta-Description
≤ 160, FAQ-Frage/-Antwort nicht leer, Telefon/E-Mail plausibel.

## Deployment auf Cloudflare Pages

1. Repository mit Cloudflare Pages verbinden.
2. **Build command:** `npm run build` · **Output directory:** `dist`
3. Unter *Settings → Variables and Secrets* alle Variablen aus `.env.example`
   eintragen (`COSMIC_WRITE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` als *Secret*).
4. `compatibility_flags = ["nodejs_compat"]` ist in `wrangler.jsonc` gesetzt.
5. Optional: *Deploy Hook* anlegen und als `CLOUDFLARE_DEPLOY_HOOK_URL`
   hinterlegen – dann veröffentlicht das Dashboard nach dem Speichern neu.

## Rechtliches

`impressum.astro` und `datenschutz.astro` sind als Gerüst angelegt und mit
`TODO Kundin`-Markierungen versehen (vollständige Anschrift, USt-IdNr.,
eingesetzte Dienste). Bitte vor dem Live-Gang rechtlich prüfen lassen.
