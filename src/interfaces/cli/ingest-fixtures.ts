import { ingestFixtures } from '../../application/usecases/ingestFixtures.js';
import { logger } from '../../infrastructure/logging/logger.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const seasonArg = args.find((a) => a.startsWith('--season='));
    const season = seasonArg ? seasonArg.split('=')[1] : new Date().getFullYear().toString();
    const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === '1';
    await ingestFixtures(season, undefined, { dryRun });
    logger.info('Fixtures ingestion finished successfully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Fixtures ingestion failed');
    process.exit(1);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();


