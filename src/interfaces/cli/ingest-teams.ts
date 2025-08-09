import { ingestSuperLigTeams } from '../../application/usecases/ingestSuperLigTeams.js';
import { logger } from '../../infrastructure/logging/logger.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === '1';
    await ingestSuperLigTeams(undefined, { dryRun });
    logger.info('Ingestion finished successfully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Ingestion failed');
    process.exit(1);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();


