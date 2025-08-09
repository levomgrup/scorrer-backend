import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { getMongoDb } from '../../infrastructure/db/mongo/MongoClientFactory.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(swagger, {
  openapi: {
    info: { title: 'Scorrer API', version: '1.0.0' },
  },
});
await app.register(swaggerUI, { routePrefix: '/docs' });

app.get('/healthz', async () => ({ status: 'ok' }));

app.get('/api/teams', async () => {
  const db = await getMongoDb();
  const teams = await db.collection('teams').find({}).sort({ name: 1 }).toArray();
  return teams;
});

app.get('/api/matches', async (req: any) => {
  const db = await getMongoDb();
  const { season, status } = req.query ?? {};
  const q: any = {};
  if (season) q.season = String(season);
  if (status) q.status = String(status);
  const matches = await db.collection('matches').find(q).sort({ dateUtc: 1 }).toArray();
  return matches;
});

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: '0.0.0.0' });
console.log(`API listening on http://localhost:${port} (docs at /docs)`);


