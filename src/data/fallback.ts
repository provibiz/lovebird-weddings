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
      cta_text: 'Anfrage stellen',
      cta_link: '/kontakt',
      about_title: 'Gemeinsam schaffen wir *Erinnerungen*.',
      about_text:
        '<p>Mein Name ist Sarah, ich bin 27 Jahre alt und seit zwei Jahren glücklich verheiratet. Schon immer begleitet mich, neben ganz viel Herz und Empathie, mein Planungstalent und meine Detailverliebtheit.</p><p>Nach meiner eigenen Traumhochzeit durfte ich bereits bei vielen einzigartigen Veranstaltungen mitwirken. Mit Sitz zwischen Halle (Saale) und Leipzig konzipiere und realisiere ich individuelle und einzigartige Events – von der anfänglichen Planung bis zur Auswahl des perfekten Konzepts stehe ich euch zur Seite.</p>',
      about_image_1: '/assets/images/img_028_5a661839.jpg',
      about_image_2: '/assets/images/img_026_55fad26d.jpg',
      teasers: [
        {
          num: 'I — Komplettplanung',
          title: 'Individuelle Planung',
          image: '/assets/images/img_040_77bd4476.jpg',
          text: '<p>Jede Hochzeit ist so einzigartig wie das Paar, das sie feiert. Wir kümmern uns um jedes Detail – von der Auswahl der Location bis zur perfekten Blumendeko – damit ihr entspannt die Vorfreude genießen könnt.</p>',
        },
        {
          num: 'II — Am großen Tag',
          title: 'Wedding Day Manager',
          image: '/assets/images/img_070_decb5f25.jpg',
          text: '<p>Eure Hochzeit ist geplant und ihr möchtet am großen Tag nichts dem Zufall überlassen? Wir koordinieren alle Abläufe, betreuen Dienstleister und lösen kleine Herausforderungen im Hintergrund.</p>',
        },
        {
          num: 'III — Detailliebe',
          title: 'Eventpapeterie',
          image: '/assets/images/img_055_a41e12aa.jpg',
          text: '<p>Eure Hochzeit beginnt mit der Einladung, die eure Gäste in Händen halten. Stilvolle Save-the-Date-Karten, Einladungen, Menükarten und Sitzpläne – harmonisch auf euer Konzept abgestimmt.</p>',
        },
      ],
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

  portfolio: [
    { slug: 'kirsten-toni', date: 'Aug 2025', name: 'Kirsten & Toni', subtitle: 'Bordeaux-Farbtöne auf dem Reiterhof', image: '/assets/images/img_034_6658439a.jpg' },
    { slug: 'michelle-david', date: 'Aug 2025', name: 'Michelle & David', subtitle: 'Kirchliche Trauung im Duisburger Innenhafen', image: '/assets/images/img_071_ded3d110.jpg' },
    { slug: 'lisa-kenny', date: 'Apr 2025', name: 'Lisa & Kenny', subtitle: 'Rosttöne auf dem Weingut · Brunnenhaus', image: '/assets/images/img_019_453faeab.jpg' },
    { slug: 'sally-jens', date: 'Mär 2025', name: 'Sally & Jens', subtitle: 'Espresso Martini im Glashaus', image: '/assets/images/img_024_4cdc1c31.jpg' },
    { slug: 'lisa-alexander', date: 'Mär 2025', name: 'Lisa & Alexander', subtitle: 'Schlosshochzeit im Frühling', image: '/assets/images/img_042_7cba3860.jpg' },
    { slug: 'carolin-joerg', date: 'Sept 2024', name: 'Carolin & Jörg', subtitle: 'Industrial Wedding mit Kräuterduft', image: '/assets/images/img_027_56aa8d6e.jpg' },
    { slug: 'johanna-david', date: 'Aug 2024', name: 'Johanna & David', subtitle: 'Romantische Klosterhochzeit', image: '/assets/images/img_064_c5c55911.jpg' },
    { slug: 'taiza-christopher', date: 'Aug 2024', name: 'Taiza & Christopher', subtitle: 'Deutsch-Brasilianische Feier der Liebe', image: '/assets/images/img_007_16bc9b57.jpg' },
    { slug: 'jacqueline-nico', date: 'Jul 2024', name: 'Jacqueline & Nico', subtitle: 'Scheunenhochzeit und Partystimmung', image: '/assets/images/img_033_6215f113.jpg' },
    { slug: 'thea-romano', date: 'Jul 2024', name: 'Thea & Romano', subtitle: 'Greenery Wedding', image: '/assets/images/img_010_2391920f.jpg' },
    { slug: 'larissa-sebastian', date: 'Mai 2024', name: 'Larissa & Sebastian', subtitle: 'Sommerhochzeit in Pastell', image: '/assets/images/img_004_130427fb.jpg' },
    { slug: 'lisa-clemens', date: 'Mai 2024', name: 'Lisa & Clemens', subtitle: 'White Wedding im Jagdschloss', image: '/assets/images/img_076_f64976e5.jpg' },
    { slug: 'annemarie-fabian', date: 'Apr 2024', name: 'Anne-Marie & Fabian', subtitle: 'Ostseehochzeit', image: '/assets/images/img_006_1617988c.jpg' },
    { slug: 'jenny-nils', date: 'Mai 2023', name: 'Jenny & Nils', subtitle: 'Scheunenhochzeit in Familie', image: '/assets/images/img_002_06e89c51.jpg' },
    { slug: 'sarah-stefan', date: 'Jul 2022', name: 'Sarah & Stefan', subtitle: 'Unsere Traumhochzeit', image: '/assets/images/img_067_ced7b4e0.jpg' },
  ],
};
