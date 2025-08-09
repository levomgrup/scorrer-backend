import dotenv from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  SCRAPER_USER_AGENT: str({ default: 'scorrer-bot/1.0 (+https://example.com)' }),
  SCRAPER_TIMEOUT_MS: num({ default: 15000 }),
});


