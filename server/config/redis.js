import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

// Create Redis client with reconnection strategy
export const redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis reconnection attempt ${times}, delay: ${delay}ms`);
        return delay;
    },
    reconnectOnError(err) {
        logger.error('Redis reconnect on error', { error: err.message });
        return true;
    }
});

// Event handlers
redisClient.on('connect', () => {
    logger.info('✅ Redis client connected successfully');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready to accept commands');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error', { error: err.message });
});

redisClient.on('close', () => {
    logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
});

// Test connection
export async function testRedisConnection() {
    try {
        await redisClient.ping();
        logger.info('Redis PING successful');
        return true;
    } catch (error) {
        logger.error('❌ Failed to connect to Redis', { error: error.message });
        throw error;
    }
}

// Graceful shutdown
export async function closeRedis() {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
}
