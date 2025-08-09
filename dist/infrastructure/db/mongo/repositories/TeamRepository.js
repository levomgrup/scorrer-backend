export class TeamRepository {
    collection;
    constructor(db) {
        this.collection = db.collection('teams');
    }
    async ensureIndexes() {
        await this.collection.createIndex({ tffTeamId: 1 }, { unique: true, name: 'uniq_tffTeamId' });
        await this.collection.createIndex({ slug: 1 }, { unique: true, sparse: true, name: 'uniq_slug' });
    }
    async upsertMany(teams) {
        if (teams.length === 0)
            return { upserted: 0, matched: 0 };
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
