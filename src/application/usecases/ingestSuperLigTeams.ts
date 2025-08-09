import { FetchClient } from '../../infrastructure/http/FetchClient.js';
import { GotFetchClient } from '../../infrastructure/http/GotFetchClient.js';
import { parseSuperLigTeams } from '../../infrastructure/parsing/tff/pages/teamsPage.parser.js';
import { logger } from '../../infrastructure/logging/logger.js';

const TFF_LEAGUE_URL = 'https://www.tff.org/default.aspx?pageID=198';

export async function ingestSuperLigTeams(
  deps?: { fetch?: FetchClient },
  options?: { dryRun?: boolean }
): Promise<void> {
  const fetch = deps?.fetch ?? new GotFetchClient();
  logger.info({ url: TFF_LEAGUE_URL }, 'Fetching TFF Super Lig page');
  const res = await fetch.get(TFF_LEAGUE_URL);
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Unexpected status ${res.statusCode} for ${res.url}`);
  }

  const teams = parseSuperLigTeams(res.body);
  logger.info({ count: teams.length }, 'Parsed teams');

  if (options?.dryRun) {
    logger.info({ sample: teams.slice(0, 8) }, 'Dry run: sample teams');
    return;
  }

  const { getMongoDb } = await import('../../infrastructure/db/mongo/MongoClientFactory.js');
  const { TeamRepository } = await import('../../infrastructure/db/mongo/repositories/TeamRepository.js');
  const db = await getMongoDb();
  const repo = new TeamRepository(db);
  await repo.ensureIndexes();
  const result = await repo.upsertMany(teams);
  logger.info({ result }, 'Upserted teams');
}


