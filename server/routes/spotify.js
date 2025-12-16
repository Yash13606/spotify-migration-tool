import express from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/retryWithBackoff.js';
import { spotifyApiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
    const { accountType } = req.query || req.body;

    if (!accountType || !['old', 'new'].includes(accountType)) {
        return res.error('Invalid or missing account type', 'INVALID_ACCOUNT_TYPE', 400);
    }

    const account = req.session[`${accountType}Account`];

    if (!account || !account.accessToken) {
        return res.error('Not authenticated. Please login first.', 'NOT_AUTHENTICATED', 401);
    }

    // Check if token is expired
    if (Date.now() >= account.expiresAt) {
        return res.error('Access token expired. Please refresh.', 'TOKEN_EXPIRED', 401);
    }

    // Attach account to request for convenience
    req.spotifyAccount = account;
    next();
}

/**
 * GET /api/spotify/me
 * Get user profile
 * Query: { accountType: 'old' | 'new' }
 */
router.get('/me', spotifyApiLimiter, requireAuth, async (req, res) => {
    try {
        const profile = await retryWithBackoff(async () => {
            return axios.get('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${req.spotifyAccount.accessToken}` }
            });
        });

        return res.success(profile.data);
    } catch (error) {
        logger.error('Failed to fetch user profile', {
            error: error.message,
            accountType: req.query.accountType
        });
        return res.error('Failed to fetch user profile', 'PROFILE_ERROR', 500);
    }
});

/**
 * GET /api/spotify/tracks
 * Fetch liked songs with pagination
 * Query: { accountType: 'old' | 'new', offset: number, limit: number }
 */
router.get('/tracks', spotifyApiLimiter, requireAuth, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = Math.min(parseInt(req.query.limit) || 50, 50); // Max 50 per Spotify API

        const response = await retryWithBackoff(async () => {
            return axios.get('https://api.spotify.com/v1/me/tracks', {
                params: { offset, limit },
                headers: { Authorization: `Bearer ${req.spotifyAccount.accessToken}` }
            });
        });

        logger.debug('Fetched liked songs', {
            accountType: req.query.accountType,
            offset,
            limit,
            total: response.data.total,
            returned: response.data.items.length
        });

        return res.success(response.data);
    } catch (error) {
        logger.error('Failed to fetch liked songs', {
            error: error.message,
            accountType: req.query.accountType,
            offset: req.query.offset
        });
        return res.error('Failed to fetch liked songs', 'FETCH_TRACKS_ERROR', 500);
    }
});

/**
 * POST /api/spotify/add-tracks
 * Add tracks to user's liked songs
 * Body: { accountType: 'new', trackIds: string[] } (max 50 IDs)
 */
router.post('/add-tracks', spotifyApiLimiter, requireAuth, async (req, res) => {
    try {
        const { trackIds } = req.body;

        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            return res.error('trackIds must be a non-empty array', 'INVALID_TRACK_IDS', 400);
        }

        if (trackIds.length > 50) {
            return res.error('Maximum 50 track IDs per request', 'TOO_MANY_TRACKS', 400);
        }

        // Add tracks with retry logic
        await retryWithBackoff(async () => {
            return axios.put(
                'https://api.spotify.com/v1/me/tracks',
                { ids: trackIds },
                {
                    headers: {
                        Authorization: `Bearer ${req.spotifyAccount.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }, { maxRetries: 3, baseDelay: 1000 });

        logger.info('Added tracks successfully', {
            accountType: req.body.accountType,
            count: trackIds.length
        });

        return res.success({
            added: trackIds.length,
            message: `Successfully added ${trackIds.length} tracks`
        });
    } catch (error) {
        logger.error('Failed to add tracks', {
            error: error.message,
            response: error.response?.data,
            accountType: req.body.accountType,
            trackCount: req.body.trackIds?.length
        });

        // Check for specific Spotify errors
        if (error.response?.status === 403) {
            return res.error('Insufficient permissions to add tracks', 'PERMISSION_DENIED', 403);
        }

        return res.error('Failed to add tracks', 'ADD_TRACKS_ERROR', 500);
    }
});

/**
 * POST /api/spotify/check-saved
 * Check if tracks are already saved
 * Body: { accountType: 'new', trackIds: string[] } (max 50 IDs)
 */
router.post('/check-saved', spotifyApiLimiter, requireAuth, async (req, res) => {
    try {
        const { trackIds } = req.body;

        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            return res.error('trackIds must be a non-empty array', 'INVALID_TRACK_IDS', 400);
        }

        if (trackIds.length > 50) {
            return res.error('Maximum 50 track IDs per request', 'TOO_MANY_TRACKS', 400);
        }

        const response = await retryWithBackoff(async () => {
            return axios.get('https://api.spotify.com/v1/me/tracks/contains', {
                params: { ids: trackIds.join(',') },
                headers: { Authorization: `Bearer ${req.spotifyAccount.accessToken}` }
            });
        });

        // Returns array of booleans indicating if each track is saved
        return res.success({
            trackIds,
            saved: response.data
        });
    } catch (error) {
        logger.error('Failed to check saved tracks', {
            error: error.message,
            accountType: req.body.accountType
        });
        return res.error('Failed to check saved tracks', 'CHECK_SAVED_ERROR', 500);
    }
});

export default router;
