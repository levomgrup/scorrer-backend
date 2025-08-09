import cheerio from 'cheerio';
import { ParseError, ValidationError } from '../../../../shared/errors.js';
import { Team, TeamSchema } from '../../../../domain/models/Team.js';

// Sadece Süper Lig puan tablosundaki (standings) takımları parse eder
export function parseSuperLigTeams(html: string): Team[] {
  try {
    const $ = cheerio.load(html);

    const teams: Team[] = [];

    // Puan cetveli: .s-table içinde, takım linkleri genelde id'si _lnkTakim ile biter
    const clubLinks = $('table.s-table a[id$="_lnkTakim"]');

    clubLinks.each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const rawText = $(el).text();
      const cleanName = normalizeTeamText(rawText);
      const tffTeamId = extractKulupId(href);
      if (tffTeamId && cleanName) {
        const slug = slugify(cleanName);
        const candidate = { tffTeamId, name: cleanName, slug };
        const team = TeamSchema.parse(candidate);
        if (!teams.find((t) => t.tffTeamId === team.tffTeamId)) {
          teams.push(team);
        }
      }
    });

    if (teams.length === 0) {
      throw new ValidationError('No teams parsed from standings table');
    }

    return teams;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ParseError('Failed to parse Super Lig teams', err);
  }
}

function normalizeTeamText(text: string): string {
  const t = (text || '')
    .replace(/\u00a0/g, ' ') // NBSP → space
    .trim()
    // Başındaki sıra numarası ve nokta kaldırılır (örn. 1.GALATASARAY A.Ş.)
    .replace(/^\d+\.?\s*/, '');
  return t;
}

function extractKulupId(href: string): number | null {
  const match = href.match(/(?:\?|&)kulup(?:id|ID)=(\d+)/);
  if (match) return Number(match[1]);
  // Yedek: URLSearchParams ile (case insensitive anahtar araması)
  try {
    const url = new URL(href, 'https://www.tff.org/');
    for (const [k, v] of url.searchParams.entries()) {
      if (k.toLowerCase() === 'kulupid') return Number(v);
    }
  } catch {}
  return null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}


