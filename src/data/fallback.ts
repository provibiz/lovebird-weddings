import type { SiteContent } from '@/lib/types';

// Local fallback content. The public site renders this verbatim when Cosmic
// is not configured, and the dashboard seeds new Cosmic objects from it.
// Text is taken 1:1 from the approved design template (+ details recovered
// from the old lovebirdweddings.de site).

export const fallbackContent: SiteContent = {
  site_settings: {
    company_name: 'Lovebird Weddings & Events',
    phone: '+49 (0) 176 552 777 33',
    phone_href: '+4917655277733',
    email: 'mail@lovebirdweddings.de',
    address: 'zwischen Halle (Saale) und Leipzig',
    opening_hours: 'Termine nach Vereinbarung',
    logo: '',
    social_links: [
      { label: '@lovebird.weddings.events', url: 'https://instagram.com/lovebird.weddings.events' },
    ],
    default_seo_title:
      'Lovebird Weddings — Individuelle Hochzeitsplanung & Wedding Day Management',
    default_seo_description:
      'Sarah von Lovebird Weddings plant eure Traumhochzeit zwischen Halle (Saale) und Leipzig – mit Liebe zum Detail, kreativen Ideen und perfekter Organisation.',
    default_og_image: '/assets/images/hero.jpg',
  },

  pages: {
    index: {
      title: 'Startseite',
      slug: 'index',
      seo_title:
        'Lovebird Weddings — Individuelle Hochzeitsplanung & Wedding Day Management',
      seo_description:
        'Sarah von Lovebird Weddings plant eure Traumhochzeit zwischen Halle (Saale) und Leipzig – mit Liebe zum Detail, kreativen Ideen und perfekter Organisation.',
      hero_title: 'Eure Liebe,\neure Geschichte,\neure Traumhochzeit.',
      hero_text:
        'Ihr habt euch gefunden – nun plant ihr den schönsten Tag eures Lebens, voller Liebe, Emotionen und unvergesslicher Momente. Wir gestalten eure Hochzeit so einzigartig wie eure Geschichte: mit perfekter Organisation, kreativen Ideen und Liebe zum Detail.',
      hero_image: '/assets/images/hero.jpg',
    },
    leistungen: {
      title: 'Leistungen',
      slug: 'leistungen',
      seo_title: 'Leistungen — Lovebird Weddings',
      seo_description:
        'Komplettplanung, Wedding Day Management, Eventpapeterie, Teilplanung und mehr – die Leistungen von Lovebird Weddings rund um eure Hochzeit.',
      hero_title: 'Unsere *Leistungen*',
      hero_text:
        'Vertraut auf unsere Erfahrung, ein kompetentes Dienstleisternetzwerk und die Leidenschaft, eure Traumhochzeit Wirklichkeit werden zu lassen.',
    },
    portfolio: {
      title: 'Portfolio',
      slug: 'portfolio',
      seo_title: 'Portfolio — Lovebird Weddings',
      seo_description:
        'Authentisch, stilvoll und mit Liebe zum Detail: Einblicke in einige der Hochzeiten und Projekte, die Lovebird Weddings begleiten durfte.',
      hero_title: 'Unser *Portfolio*',
      hero_text:
        'Authentisch, stilvoll und mit Liebe zum Detail gestalten wir gemeinsam eure einzigartige Veranstaltung. Hier zeigen wir einige der Hochzeiten und Projekte, die wir bereits planen und begleiten durften.',
    },
    brunnenhaus: {
      title: 'Brunnenhaus',
      slug: 'brunnenhaus',
      seo_title: 'Eventlocation Brunnenhaus — Lovebird Weddings',
      seo_description:
        'Die exklusive Eventlocation Brunnenhaus auf dem Weingut Pawis in den Weinbergen Freyburgs an der Unstrut – Hochzeiten für bis zu 80 Gäste.',
      hero_title: 'Brunnenhaus\n*in den Weinbergen Freyburg*',
      hero_text:
        'Unsere exklusive Eventlocation auf dem Weingut Pawis – ein Ort, an dem Tradition, Wein und Romantik zu einer unvergesslichen Kulisse verschmelzen.',
    },
    kontakt: {
      title: 'Kontakt',
      slug: 'kontakt',
      seo_title: 'Kontakt — Lovebird Weddings',
      seo_description:
        'Kontaktiert Lovebird Weddings für ein unverbindliches Beratungsgespräch zu eurer Traumhochzeit – telefonisch, per E-Mail oder über das Anfrageformular.',
      hero_title: 'Bereit, den *ersten Schritt* zu machen?',
      hero_text:
        'Kontaktiert uns für ein unverbindliches Beratungsgespräch. Wir freuen uns darauf, Teil eurer Liebesgeschichte zu werden.',
    },
  },

  services: [
    {
      title: 'Wedding Day Manager',
      slug: 'wedding-day-manager',
      short_description:
        'Eure Hochzeit ist geplant und ihr möchtet am großen Tag nichts dem Zufall überlassen? Wir koordinieren alle Abläufe, betreuen Dienstleister und lösen kleine Herausforderungen im Hintergrund.',
      description:
        'Als Zeremonienmeisterin begleite ich euch auf eurem ganz persönlichen Weg zum Altar. Am Hochzeitstag stehe ich für euch und eure Gäste zur Verfügung, koordiniere alle Dienstleister und den Tagesablauf – damit ihr diesen einzigartigen Tag in vollen Zügen genießen könnt.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
    {
      title: 'Komplettplanung',
      slug: 'komplettplanung',
      short_description:
        'Jede Hochzeit ist so einzigartig wie das Paar, das sie feiert. Wir kümmern uns um jedes Detail – von der Auswahl der Location bis zur perfekten Blumendeko.',
      description:
        'Eine Hochzeitsplanung in vollem Umfang bedeutet persönliche Betreuung und professionelle Beratung – von den ersten Ideen bis zu eurem perfekten Hochzeitstag. Jede Entscheidung wird mit Sorgfalt, Stilgefühl und Liebe zum Detail begleitet.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
    {
      title: 'Eventpapeterie',
      slug: 'eventpapeterie',
      short_description:
        'Eure Hochzeit beginnt mit der Einladung. Stilvolle Save-the-Date-Karten, Einladungen, Menükarten und Sitzpläne – harmonisch auf euer Konzept abgestimmt.',
      description:
        'Gern erstelle ich individuelle Papeterie: von Save-the-Date-Karten über Einladungen, Menü- und Getränkekarten, Gastgeschenken und Hochzeitszeitungen bis hin zur Dankeskarte – harmonisch abgestimmt auf euer Hochzeitskonzept.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
    {
      title: 'Teilplanung',
      slug: 'teilplanung',
      short_description:
        'Werdet ihr selbst oder eure Lieblingsmenschen aktiv und es sind nur einzelne Posten abzugeben? Gebt diese in professionelle Hände.',
      description:
        'Werdet ihr selbst oder eure Lieblingsmenschen aktiv und es sind nur einzelne Posten abzugeben? Gebt diese in professionelle Hände – gemeinsam setzen wir jeden Wunsch um.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
    {
      title: 'Wedding Talk',
      slug: 'wedding-talk',
      short_description:
        'Bei einem persönlichen oder digitalen Treffen besprechen wir alle Themen, die für euch in der Planungszeit und am großen Tag relevant werden.',
      description:
        'Bei einem persönlichen oder digitalen Treffen besprechen wir alle Themen, die für euch als Brautpaar – oder als Angehörige und Trauzeugen – in der Planungszeit und am großen Tag relevant werden.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
    {
      title: 'Location- & Dienstleisterscouting',
      slug: 'location-scouting',
      short_description:
        'Fehlt euch noch die perfekte Hochzeitslocation oder einzelne Dienstleister? Profitiert von meinem umfassenden Netzwerk und Herzensempfehlungen.',
      description:
        'Fehlt euch noch die perfekte Hochzeitslocation? Sucht ihr noch alle oder einzelne geeignete Dienstleister? Profitiert von meinem umfassenden Netzwerk und Herzensempfehlungen.',
      benefits: [],
      cta_text: 'Mehr erfahren',
    },
  ],

  faqs: [],

  testimonials: [
    {
      name: 'Lisa & Kenny',
      text: 'Bis ins kleinste Detail und unendlich liebevoll hat Sarah die Planung unserer Traumhochzeit übernommen. Sie ist immer einen Schritt und Gedanken voraus, kaum haben wir eine Idee bzw. einen Wunsch in den Raum gestellt, lag uns auch schon das erste Angebot vor. Sarah, du hast unseren Tag zu einer unvergesslichen Traumhochzeit gemacht.',
      rating: 5,
      source: 'Google',
    },
    {
      name: 'Lisa & Alexander',
      text: 'Wir haben unsere Menü- und Getränkekarten sowie den Sitzplan von Sarah gestalten lassen. Die liebe Sarah hat uns super schnell Entwürfe geschickt – Sarah hat uns nicht nur wunderschöne Papeterie gestaltet, sondern uns auch menschlich absolut umgehauen. Die Zusammenarbeit war unkompliziert und leicht.',
      rating: 5,
      source: 'Google',
    },
    {
      name: 'Johanna & David',
      text: 'Wir sind einfach begeistert von unserer Zeremonienmeisterin Sarah! Sie hat unsere Hochzeit zu einem unvergesslichen Erlebnis gemacht. Von der ersten Beratung bis hin zur letzten Minute der Feier war sie stets professionell, herzlich und unglaublich organisiert.',
      rating: 5,
      source: 'Google',
    },
    {
      name: 'Thea & Romano',
      text: 'Wir hatten das große Glück, Sarah als unsere Hochzeitsplanerin zu engagieren – die beste Entscheidung, die wir getroffen haben! Sie kennt sich sehr gut in der Branche aus und ist perfektionistisch auf eine liebevolle Art. Sarah ist ein absoluter Mehrwert für jedes Brautpaar und ein wahrer Herzensmensch!',
      rating: 5,
      source: 'Google',
    },
  ],
};
