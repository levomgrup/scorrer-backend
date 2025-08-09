export function normalizeTeamText(text: string): string {
  const t = (text || '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/^\d+\.?\s*/, '');
  return t;
}

export function extractKulupId(href: string): number | null {
  if (!href) return null;
  const match = href.match(/(?:\?|&)kulup(?:id|ID)=(\d+)/);
  if (match) return Number(match[1]);
  try {
    const url = new URL(href, 'https://www.tff.org/');
    for (const [k, v] of url.searchParams.entries()) {
      if (k.toLowerCase() === 'kulupid') return Number(v);
    }
  } catch {}
  return null;
}

export function extractMacId(href: string): number | null {
  if (!href) return null;
  const match = href.match(/(?:\?|&)mac(?:id|Id|ID)=(\d+)/);
  if (match) return Number(match[1]);
  try {
    const url = new URL(href, 'https://www.tff.org/');
    for (const [k, v] of url.searchParams.entries()) {
      if (k.toLowerCase() === 'macid') return Number(v);
    }
  } catch {}
  return null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}


