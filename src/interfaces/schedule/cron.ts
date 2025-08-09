import cron from 'node-cron';
import { ingestFixtures } from '../../application/usecases/ingestFixtures.js';
import { ingestSuperLigTeams } from '../../application/usecases/ingestSuperLigTeams.js';
import { logger } from '../../infrastructure/logging/logger.js';

const season = process.env.SEASON ?? `${new Date().getFullYear()}-${(new Date().getFullYear()+1).toString().slice(-2)}`;

async function runSafe<T>(name: string, fn: () => Promise<T>) {
  try {
    await fn();
    logger.info({ job: name }, 'Job finished');
  } catch (err) {
    logger.error({ job: name, err }, 'Job failed');
  }
}

// Maç saatlerinde ve maç bitiminden sonra daha sık
// - Saatlik genel update
cron.schedule('0 * * * *', () => runSafe('hourly:fixtures', () => ingestFixtures(season)));
// - Akşam yoğunluk: her 15 dakikada bir 18:00-23:59
cron.schedule('*/15 18-23 * * *', () => runSafe('evening:fixtures', () => ingestFixtures(season)));
// - Günde bir kez takımlar
cron.schedule('0 3 * * *', () => runSafe('daily:teams', () => ingestSuperLigTeams()));

logger.info('Cron scheduler started');


