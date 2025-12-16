import express from 'express';
import cors from 'cors';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { validateEnv } from './config/env-validator.js';
import { testConnection, closePool } from './config/database.js';
import { redisClient, testRedisConnection, closeRedis } from './config/redis.js';
import { logger, logRequest } from './utils/logger.js';
import { responseWrapper } from './middleware/responseWrapper.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import spotifyRoutes from './routes/spotify.js';

// Validate environment variables BEFORE starting server
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(logRequest);

// Session configuration with Redis store
const sessionConfig = {
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
};

app.use(session(sessionConfig));

// Response wrapper middleware (adds res.success and res.error)
app.use(responseWrapper);

// Global rate limiting
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.success({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/spotify', spotifyRoutes);

// 404 handler
app.use((req, res) => {
    res.error('Route not found', 'NOT_FOUND', 404);
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });

    res.error(
        process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        'INTERNAL_ERROR',
        500
    );
});

// Initialize server
async function startServer() {
    try {
        // Test database connection
        await testConnection();

        // Test Redis connection
        await testRedisConnection();

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`\n✅ Server ready at http://localhost:${PORT}`);
            console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        logger.error('Failed to start server', { error: error.message });
        console.error('\n❌ Server startup failed:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await closePool();
    await closeRedis();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await closePool();
    await closeRedis();
    process.exit(0);
});

// Start the server
startServer();
