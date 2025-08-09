import got from 'got';
import iconv from 'iconv-lite';
import { env } from '../../config/env.js';
import { FetchClient, FetchResponse } from './FetchClient.js';
import { FetchError } from '../../shared/errors.js';

export class GotFetchClient implements FetchClient {
  async get(url: string): Promise<FetchResponse> {
    try {
      const res = await got(url, {
        headers: {
          'user-agent': env.SCRAPER_USER_AGENT,
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: { request: env.SCRAPER_TIMEOUT_MS },
        retry: { limit: 2 },
        http2: true,
        responseType: 'buffer',
      });
      const contentType = res.headers['content-type'] ?? '';
      const raw = res.rawBody as Buffer;
      // Heuristic: TFF genelde ISO-8859-9/Windows-1254 kullanır, header/metada charset geçer
      const headSnippet = raw.subarray(0, 2048).toString('ascii');
      const hasIsoMeta = /charset\s*=\s*(?:iso-8859-9|windows-1254)/i.test(headSnippet) || /charset=iso-8859-9/i.test(contentType) || /charset=windows-1254/i.test(contentType);
      let body: string;
      if (hasIsoMeta || /:\/\/[^\/]*tff\.org\//i.test(url)) {
        // Zorla TR kodlaması
        body = iconv.decode(raw, 'windows-1254');
      } else {
        body = raw.toString('utf8');
      }
      return { url: res.url, statusCode: res.statusCode ?? 200, body };
    } catch (err) {
      throw new FetchError(`GET failed for ${url}`, err);
    }
  }
}


