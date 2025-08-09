import { ingestSuperLigTeams } from '../../application/usecases/ingestSuperLigTeams.js';
import { logger } from '../../infrastructure/logging/logger.js';
async function main() {
    try {
        await ingestSuperLigTeams();
        logger.info('Ingestion finished successfully');
        process.exit(0);
    }
    catch (err) {
        logger.error({ err }, 'Ingestion failed');
        process.exit(1);
    }
}
// eslint-disable-next-line unicorn/prefer-top-level-await
main();
