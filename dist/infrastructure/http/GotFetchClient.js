import got from 'got';
import { env } from '../../config/env.js';
import { FetchError } from '../../shared/errors.js';
export class GotFetchClient {
    async get(url) {
        try {
            const res = await got(url, {
                headers: {
                    'user-agent': env.SCRAPER_USER_AGENT,
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                timeout: { request: env.SCRAPER_TIMEOUT_MS },
                retry: { limit: 2 },
                http2: true,
            });
            return { url: res.url, statusCode: res.statusCode ?? 200, body: res.body };
        }
        catch (err) {
            throw new FetchError(`GET failed for ${url}`, err);
        }
    }
}
