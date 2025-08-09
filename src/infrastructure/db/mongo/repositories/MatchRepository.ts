import { Collection, Db } from 'mongodb';
import { Match } from '../../../../domain/models/Match.js';

export class MatchRepository {
  private collection: Collection<Match>;
  constructor(db: Db) {
    this.collection = db.collection<Match>('matches');
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ tffMatchId: 1 }, { unique: true, name: 'uniq_tffMatchId' });
    await this.collection.createIndex({ season: 1, round: 1 }, { name: 'season_round' });
    await this.collection.createIndex({ status: 1 }, { name: 'status' });
  }

  async upsertMany(matches: Match[]): Promise<{ upserted: number; matched: number }>{
    if (matches.length === 0) return { upserted: 0, matched: 0 };
    const ops = matches.map((m) => ({
      updateOne: {
        filter: { tffMatchId: m.tffMatchId },
        update: { $set: m },
        upsert: true,
      },
    }));
    const res = await this.collection.bulkWrite(ops, { ordered: false });
    return { upserted: res.upsertedCount ?? 0, matched: res.matchedCount ?? 0 };
  }
}


