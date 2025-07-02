// db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        // require: true,
        rejectUnauthorized: false
    },
});

// Mongoose-like method
export const connectDB = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL connected at', res.rows[0].now);
    } catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err);
        throw err; // So caller (index.js) can handle it
    }
};

// Utility query method (optional)
export const query = (text, params) => pool.query(text, params);
