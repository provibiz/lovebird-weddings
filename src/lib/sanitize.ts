// Minimaler, konservativer HTML-Sanitizer für die Rich-Text-Felder.
// Erlaubt nur eine kleine Whitelist (fett, kursiv, Unterstreichung, Listen,
// Absätze, Zeilenumbruch, Links). Alle anderen Tags, Attribute, Styles,
// Skripte und Event-Handler werden entfernt. Läuft serverseitig beim Speichern.

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'a',
]);

function isSafeHref(href: string): boolean {
  const v = href.trim();
  return (
    v.startsWith('/') ||
    v.startsWith('#') ||
    /^https?:\/\//i.test(v) ||
    /^mailto:/i.test(v) ||
    /^tel:/i.test(v)
  );
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Remove script/style blocks entirely (with content).
  let html = input.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');

  // Walk every tag, keep only whitelisted ones; rebuild with safe attributes.
  html = html.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (_m, slash, rawName, attrs) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return '';
    if (slash) return `</${name}>`;

    if (name === 'a') {
      const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)')/i);
      const href = hrefMatch ? (hrefMatch[2] ?? hrefMatch[3] ?? '') : '';
      if (href && isSafeHref(href)) {
        const external = /^https?:\/\//i.test(href);
        const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href.replace(/"/g, '&quot;')}"${rel}>`;
      }
      return '<a>';
    }
    // All other allowed tags: drop every attribute.
    return `<${name}>`;
  });

  // Strip any stray event-handler-looking leftovers (defensive).
  html = html.replace(/on\w+\s*=\s*("[^"]*"|'[^']*')/gi, '');

  return html.trim();
}

/** Plain-text version (tags stripped) – e.g. for JSON-LD / meta. */
export function stripHtml(input: string): string {
  return (input || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
