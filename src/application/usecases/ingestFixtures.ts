import { FetchClient } from '../../infrastructure/http/FetchClient.js';
import { GotFetchClient } from '../../infrastructure/http/GotFetchClient.js';
import { parseSuperLigFixtures } from '../../infrastructure/parsing/tff/pages/fixturesPage.parser.js';
import { logger } from '../../infrastructure/logging/logger.js';

const TFF_LEAGUE_URL = 'https://www.tff.org/default.aspx?pageID=198';

export async function ingestFixtures(
  season: string,
  deps?: { fetch?: FetchClient },
  options?: { dryRun?: boolean }
): Promise<void> {
  const fetch = deps?.fetch ?? new GotFetchClient();
  logger.info({ url: TFF_LEAGUE_URL }, 'Fetching TFF league page for fixtures');
  const res = await fetch.get(TFF_LEAGUE_URL);
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Unexpected status ${res.statusCode} for ${res.url}`);
  }

  const matches = parseSuperLigFixtures(res.body, season);
  logger.info({ count: matches.length }, 'Parsed matches');

  if (options?.dryRun) {
    logger.info({ sample: matches.slice(0, 5) }, 'Dry run: sample matches');
    return;
  }

  const { getMongoDb } = await import('../../infrastructure/db/mongo/MongoClientFactory.js');
  const { MatchRepository } = await import('../../infrastructure/db/mongo/repositories/MatchRepository.js');
  const db = await getMongoDb();
  const repo = new MatchRepository(db);
  await repo.ensureIndexes();
  const result = await repo.upsertMany(matches);
  logger.info({ result }, 'Upserted matches');
}


