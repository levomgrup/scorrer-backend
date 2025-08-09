import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { ParseError, ValidationError } from '../../../../shared/errors.js';
import { Match, MatchSchema } from '../../../../domain/models/Match.js';
import { extractKulupId, extractMacId, normalizeTeamText } from '../utils.js';

// TFF lig sayfasındaki maç listelerinden tüm fikstürü çıkarır.
// pageID=29&macId=... linkleri ve satırlardaki takım/istatistik hücreleri kullanılır.
export function parseSuperLigFixtures(html: string, season: string): Match[] {
  try {
    const $ = cheerio.load(html);
    const matches: Match[] = [];
    const seenMatchIds = new Set<number>();

    // Bazı sayfalarda attribute değerleri farklı büyük/küçük harf kombinasyonlarında olabilir.
    // Tüm linkleri gezip href üzerinde case-insensitive kontrol uygulayalım.
    $('a[href]').each((_, a) => {
      const href = ($(a).attr('href') ?? '').trim();
      const hrefLc = href.toLowerCase();
      if (!(hrefLc.includes('pageid=29') && hrefLc.includes('macid='))) return;
      const tffMatchId = extractMacId(href);
      if (!tffMatchId) return;
      if (seenMatchIds.has(tffMatchId)) return;

      // Yakın çevredeki takımları bulmaya çalış (genelde aynı satır içinde iki kulüp linki olur)
      const row = $(a).closest('tr');
      const teamLinks = row.find('a[href]').filter((_, el) => {
        const h = ($(el).attr('href') ?? '').toLowerCase();
        return h.includes('pageid=28') && h.includes('kulupid=');
      });
      const homeA = teamLinks.eq(0);
      const awayA = teamLinks.eq(1);
      const homeName = normalizeTeamText(homeA.text());
      const awayName = normalizeTeamText(awayA.text());
      const homeTeamId = extractKulupId(homeA.attr('href') ?? '');
      const awayTeamId = extractKulupId(awayA.attr('href') ?? '');

      if (!homeTeamId || !awayTeamId || !homeName || !awayName) return;

      // Skor hücresi (varsa): genelde row içinde X - Y şeklinde veya iki ayrı span içinde olabilir
      // Tarih/saat: soldaki tarih/saat hücresi (.haftaninMaclariTarih) → Europe/Istanbul → UTC ISO
      let dateUtc: string | null = null;
      const dateCell = row.find('.haftaninMaclariTarih').first();
      if (dateCell.length) {
        const dateText = dateCell.text().replace(/\s+/g, ' ').trim();
        const dm = dateText.match(/(\d{2}\.\d{2}\.\d{4})\s*(\d{2}:\d{2})?/);
        if (dm) {
          const d = dm[1];
          const t = dm[2] ?? '00:00';
          const ist = DateTime.fromFormat(`${d} ${t}`, 'dd.MM.yyyy HH:mm', { zone: 'Europe/Istanbul' });
          if (ist.isValid) {
            dateUtc = ist.toUTC().toISO();
          }
        }
      }

      // Skor: sadece makul aralıkta (0-15) iki sayı ve arada - ya da : bulunan bir hücre ise kabul et
      let scoreMatch: RegExpMatchArray | null = null;
      row.find('td').each((_, td) => {
        const tx = cheerio(td).text();
        const m = tx.match(/\b(\d{1,2})\s*[-:]\s*(\d{1,2})\b/);
        if (m) {
          const h = Number(m[1]);
          const a2 = Number(m[2]);
          if (h <= 15 && a2 <= 15) {
            scoreMatch = m;
            return false;
          }
        }
        return undefined;
      });

      const status: Match['status'] = scoreMatch ? 'finished' : 'scheduled';

      const matchCandidate: Match = {
        tffMatchId,
        season,
        round: null,
        dateUtc,
        homeTeam: { tffTeamId: homeTeamId, name: homeName },
        awayTeam: { tffTeamId: awayTeamId, name: awayName },
        venue: null,
        status,
        score: scoreMatch ? { home: Number(scoreMatch[1]), away: Number(scoreMatch[2]) } : null,
      };

      try {
        const m = MatchSchema.parse(matchCandidate);
        matches.push(m);
        seenMatchIds.add(tffMatchId);
      } catch {}
    });

    if (matches.length === 0) {
      throw new ValidationError('No matches parsed from fixtures');
    }
    return matches;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ParseError('Failed to parse fixtures', err);
  }
}


