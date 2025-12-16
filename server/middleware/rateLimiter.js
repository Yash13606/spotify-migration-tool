import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// General API rate limiter (100 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        });
    }
});

// Spotify API rate limiter (30 requests per minute)
export const spotifyApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        error: 'Too many Spotify API requests, please slow down',
        code: 'SPOTIFY_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        logger.warn('Spotify API rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            success: false,
            error: 'Too many Spotify API requests, please slow down',
            code: 'SPOTIFY_RATE_LIMIT',
            timestamp: new Date().toISOString()
        });
    }
});

// Auth rate limiter (stricter for login attempts)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per 15 minutes
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts, please try again later',
            code: 'AUTH_RATE_LIMIT',
            timestamp: new Date().toISOString()
        });
    }
});
