import cheerio from 'cheerio';
import { ParseError, ValidationError } from '../../../../shared/errors.js';
import { TeamSchema } from '../../../../domain/models/Team.js';
// Not: TFF sayfası dinamik ve uzun bir HTML içerir. Bu parser, Süper Lig kulüp listesi bölümünü hedefler.
export function parseSuperLigTeams(html) {
    try {
        const $ = cheerio.load(html);
        // Süper Lig kulüpleri menü/gövde içinde kulüp linkleriyle yer alır.
        // Seçici, sayfadaki "Kulüpler" bölümündeki linkleri hedefler.
        // Yedek strateji: Puan Cetveli tablosu içindeki takım adlarından türetme.
        const teams = [];
        const clubLinks = $('a[href*="pageID=28"][href*="kulupId="]');
        clubLinks.each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const name = $(el).text().trim();
            const idMatch = href.match(/kulupId=(\d+)/);
            if (idMatch && name) {
                const tffTeamId = Number(idMatch[1]);
                const slug = slugify(name);
                const candidate = { tffTeamId, name, slug };
                const team = TeamSchema.parse(candidate);
                if (!teams.find((t) => t.tffTeamId === team.tffTeamId)) {
                    teams.push(team);
                }
            }
        });
        if (teams.length === 0) {
            throw new ValidationError('No teams parsed from TFF page');
        }
        return teams;
    }
    catch (err) {
        if (err instanceof ValidationError)
            throw err;
        throw new ParseError('Failed to parse Super Lig teams', err);
    }
}
function slugify(input) {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
