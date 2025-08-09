import { MongoClient } from 'mongodb';
import { env } from '../../../config/env.js';
let client = null;
let dbInstance = null;
export async function getMongoDb() {
    if (dbInstance)
        return dbInstance;
    if (!client) {
        client = new MongoClient(env.MONGODB_URI, {
            appName: 'scorrer-backend',
        });
    }
    await client.connect();
    dbInstance = client.db(env.MONGODB_DB);
    return dbInstance;
}
