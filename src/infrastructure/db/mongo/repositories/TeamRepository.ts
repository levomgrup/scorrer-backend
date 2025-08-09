import { Collection, Db } from 'mongodb';
import { Team } from '../../../../domain/models/Team.js';

export class TeamRepository {
  private collection: Collection<Team>;

  constructor(db: Db) {
    this.collection = db.collection<Team>('teams');
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ tffTeamId: 1 }, { unique: true, name: 'uniq_tffTeamId' });
    await this.collection.createIndex({ slug: 1 }, { unique: true, sparse: true, name: 'uniq_slug' });
  }

  async upsertMany(teams: Team[]): Promise<{ upserted: number; matched: number }>{
    if (teams.length === 0) return { upserted: 0, matched: 0 };
    const ops = teams.map((t) => ({
      updateOne: {
        filter: { tffTeamId: t.tffTeamId },
        update: { $set: t },
        upsert: true,
      },
    }));
    const res = await this.collection.bulkWrite(ops, { ordered: false });
    return {
      upserted: res.upsertedCount ?? 0,
      matched: res.matchedCount ?? 0,
    };
  }
}


