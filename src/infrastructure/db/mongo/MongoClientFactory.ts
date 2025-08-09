import { MongoClient, Db } from 'mongodb';
import { dbEnv } from '../../../config/db.js';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (dbInstance) return dbInstance;
  if (!client) {
    client = new MongoClient(dbEnv.MONGODB_URI, {
      appName: 'scorrer-backend',
    });
  }
  await client.connect();
  dbInstance = client.db(dbEnv.MONGODB_DB);
  return dbInstance;
}


