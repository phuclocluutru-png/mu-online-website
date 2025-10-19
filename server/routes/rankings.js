import { Router } from 'express';
import mssql from 'mssql';
import { poolPromise } from '../index.js';

const router = Router();

// Utility to run query safely
async function runQuery(query) {
    if (!poolPromise) {
        return [];
    }
    await poolPromise; // ensure pool established
    const request = new mssql.Request();
    const result = await request.query(query);
    return result.recordset || [];
}

// Map class codes (ví dụ) sang tên đọc được nếu DB lưu dạng số
const CLASS_MAP = {
    0: 'DW', 1: 'SM', 2: 'GM', 16: 'BK', 17: 'BM', 32: 'Elf', 33: 'Muse Elf', 48: 'MG', 64: 'DL', 80: 'SU', 81: 'BS', 96: 'RF'
};

// GET /api/rankings/top-players (JOIN guild member)
router.get('/top-players', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 
                c.Name, c.cLevel, c.ResetCount, c.Relifecount, c.Class, gm.G_Name AS GuildName
            FROM Character c WITH (NOLOCK)
            LEFT JOIN GuildMember gm ON gm.Name = c.Name
            WHERE c.cLevel > 0
            ORDER BY c.cLevel DESC, c.ResetCount DESC, c.Relifecount DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            level: r.cLevel,
            reset: r.ResetCount,
            relife: r.Relifecount,
            cls: CLASS_MAP[r.Class] || r.Class,
            guild: r.GuildName || '',
            guildLogo: 'images/guild-sample.png'
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-players failed:', e.message);
        res.status(500).json({ error: 'Query failed' });
    }
});

// Placeholders cho các API khác (guild, boss, v.v.)
// Guild ranking
router.get('/top-guild', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 G_Name, G_Master, MemberCount, TotalDevote
            FROM Guild WITH (NOLOCK)
            ORDER BY MemberCount DESC, TotalDevote DESC;
        `);
        const data = rows.map(r => ({
            name: r.G_Name,
            owner: r.G_Master,
            members: r.MemberCount,
            points: r.TotalDevote,
            logo: 'images/guild-sample.png'
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-guild failed:', e.message);
        res.json([]);
    }
});

// Boss ranking
router.get('/top-boss', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, TotalPoint, Boss1Count, Boss2Count, Boss3Count, Boss4Count, Boss5Count, SupperBoss
            FROM RankingBoss WITH (NOLOCK)
            ORDER BY TotalPoint DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            points: r.TotalPoint,
            boss1: r.Boss1Count,
            boss2: r.Boss2Count,
            boss3: r.Boss3Count,
            boss4: r.Boss4Count,
            boss5: r.Boss5Count,
            superBoss: r.SupperBoss,
            guildLogo: 'images/guild-sample.png'
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-boss failed:', e.message);
        res.json([]);
    }
});

// Loan Chien ranking (PK)
router.get('/top-loan-chien', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, Kills, Deads
            FROM RankingLoanChien WITH (NOLOCK)
            ORDER BY Kills DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            kills: r.Kills,
            deaths: r.Deads
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-loan-chien failed:', e.message);
        res.json([]);
    }
});

// Blood Castle ranking
router.get('/top-bc', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, Score, KillMonsterCount
            FROM RankingBloodCastle WITH (NOLOCK)
            ORDER BY Score DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            score: r.Score,
            kills: r.KillMonsterCount
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-bc failed:', e.message);
        res.json([]);
    }
});

// Devil Square ranking
router.get('/top-dv', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, Score, KillMonsterCount
            FROM RankingDevilSquare WITH (NOLOCK)
            ORDER BY Score DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            score: r.Score,
            kills: r.KillMonsterCount
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-dv failed:', e.message);
        res.json([]);
    }
});

// Chaos Castle ranking
router.get('/top-cc', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, Score
            FROM RankingChaosCastle WITH (NOLOCK)
            ORDER BY Score DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            score: r.Score
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-cc failed:', e.message);
        res.json([]);
    }
});

// Duel ranking
router.get('/top-duel', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, WinScore, LoseScore
            FROM RankingDuel WITH (NOLOCK)
            ORDER BY WinScore DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            wins: r.WinScore,
            losses: r.LoseScore
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-duel failed:', e.message);
        res.json([]);
    }
});

// Reset ranking
router.get('/top-reset', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, ResetCount, UpdateTime
            FROM RankingReset WITH (NOLOCK)
            ORDER BY ResetCount DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            resets: r.ResetCount,
            updated: r.UpdateTime
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-reset failed:', e.message);
        res.json([]);
    }
});

// Sinh Ton ranking
router.get('/top-sinh-ton', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, TopPoint, Kills, TimeSurvivor
            FROM RankingSinhTon WITH (NOLOCK)
            ORDER BY TopPoint DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            points: r.TopPoint,
            kills: r.Kills,
            time: r.TimeSurvivor
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-sinh-ton failed:', e.message);
        res.json([]);
    }
});

// TvT ranking
router.get('/top-tvt', async (req, res) => {
    try {
        const rows = await runQuery(`
            SELECT TOP 10 Name, Kills, Deads, Assists
            FROM RankingTvT WITH (NOLOCK)
            ORDER BY Kills DESC;
        `);
        const data = rows.map(r => ({
            name: r.Name,
            kills: r.Kills,
            deaths: r.Deads,
            assists: r.Assists
        }));
        res.json(data);
    } catch (e) {
        console.error('Query /top-tvt failed:', e.message);
        res.json([]);
    }
});

export default router;
