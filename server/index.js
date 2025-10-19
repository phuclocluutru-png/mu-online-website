import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mssql from 'mssql';
import rankingsRouter from './routes/rankings.js';

dotenv.config();

const app = express();
app.use(express.json());

// CORS cấu hình (tạm thời cho phép tất cả nếu CORS_ORIGINS='*')
const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, origin || true);
        return cb(new Error('Not allowed by CORS'));
    }
}));

// API Key middleware (tùy chọn)
app.use((req, res, next) => {
    const requiredKey = process.env.API_KEY;
    if (!requiredKey) return next();
    const key = req.headers['x-api-key'];
    if (key === requiredKey) return next();
    return res.status(401).json({ error: 'Unauthorized' });
});

// MSSQL config from .env
const sqlConfig = {
    user: process.env.DB_USER || 'SA_USER_NOT_SET',
    password: process.env.DB_PASSWORD || 'PASSWORD_NOT_SET',
    server: process.env.DB_HOST || 'HOST_NOT_SET', // IP hoặc hostname VPS
    database: process.env.DB_NAME || 'DB_NOT_SET',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

// Tạo pool dùng lại cho các route
export let poolPromise;
if (process.env.DB_HOST) {
    poolPromise = mssql.connect(sqlConfig).catch(err => {
        console.error('MSSQL connection error:', err);
    });
} else {
    console.warn('DB_HOST chưa cấu hình, API sẽ trả dữ liệu rỗng hoặc fallback. Tạo file .env để kích hoạt kết nối.');
}

app.get('/api/health', async (req, res) => {
    try {
        await poolPromise;
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// Deep DB diagnostic: checks connection + simple query (character count)
app.get('/api/health/db', async (req, res) => {
    const start = Date.now();
    try {
        await poolPromise;
        const request = new mssql.Request();
        // Try lightweight count; if table missing, catch error
        let charCount = null;
        try {
            const r = await request.query('SELECT COUNT(1) AS cnt FROM Character WITH (NOLOCK)');
            charCount = r.recordset && r.recordset[0] ? r.recordset[0].cnt : null;
        } catch (inner) {
            charCount = 'unavailable';
        }
        const durationMs = Date.now() - start;
        res.json({
            status: 'ok',
            db: {
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                user: process.env.DB_USER ? 'set' : 'missing'
            },
            characterCount: charCount,
            latencyMs: durationMs
        });
    } catch (e) {
        const durationMs = Date.now() - start;
        res.status(500).json({
            status: 'error',
            message: e.message,
            latencyMs: durationMs
        });
    }
});

app.use('/api/rankings', rankingsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Ranking API server listening on port ${PORT}`);
});
