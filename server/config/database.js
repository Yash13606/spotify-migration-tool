import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    logger.info('PostgreSQL client connected');
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper function to execute queries
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        logger.error('Database query error', { text, error: error.message });
        throw error;
    }
}

// Test connection on startup
export async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        logger.info('✅ PostgreSQL database connected successfully', {
            timestamp: result.rows[0].now
        });
        return true;
    } catch (error) {
        logger.error('❌ Failed to connect to PostgreSQL database', {
            error: error.message
        });
        throw error;
    }
}

// Graceful shutdown
export async function closePool() {
    await pool.end();
    logger.info('PostgreSQL pool closed');
}
