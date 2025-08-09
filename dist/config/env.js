import dotenv from 'dotenv';
import { cleanEnv, str, url, num } from 'envalid';
dotenv.config();
export const env = cleanEnv(process.env, {
    MONGODB_URI: url(),
    MONGODB_DB: str({ default: 'scorrer' }),
    SCRAPER_USER_AGENT: str({ default: 'scorrer-bot/1.0 (+https://example.com)' }),
    SCRAPER_TIMEOUT_MS: num({ default: 15000 }),
});
