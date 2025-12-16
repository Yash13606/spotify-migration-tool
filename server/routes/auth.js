import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { query } from '../config/database.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * POST /auth/login
 * Initiate OAuth flow with PKCE
 * Body: { accountType: 'old' | 'new' }
 */
router.post('/login', authLimiter, (req, res) => {
    try {
        const { accountType } = req.body;

        if (!accountType || !['old', 'new'].includes(accountType)) {
            return res.error('Invalid account type. Must be "old" or "new"', 'INVALID_ACCOUNT_TYPE', 400);
        }

        // Generate PKCE code_verifier (random 64-byte string)
        const codeVerifier = crypto.randomBytes(64).toString('base64url');

        // Generate code_challenge (SHA256 hash of code_verifier)
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

        // Generate CSRF state token
        const state = crypto.randomBytes(32).toString('hex');

        // Store PKCE data in session (server-side only!)
        req.session.pkce = {
            codeVerifier,
            state,
            accountType
        };

        // Build Spotify authorization URL
        const scopes = [
            'user-library-read',
            'user-library-modify',
            'user-read-email'
        ].join(' ');

        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', scopes);

        logger.info('OAuth login initiated', { accountType, state });

        return res.success({ authUrl: authUrl.toString() });
    } catch (error) {
        logger.error('Login error', { error: error.message });
        return res.error('Failed to initiate login', 'LOGIN_ERROR', 500);
    }
});

/**
 * GET /auth/callback
 * Handle OAuth callback with CSRF validation
 * Query: { code, state }
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        // Check for OAuth errors
        if (error) {
            logger.error('OAuth error from Spotify', { error });
            return res.error(`Spotify authorization failed: ${error}`, 'OAUTH_ERROR', 400);
        }

        if (!code || !state) {
            return res.error('Missing code or state parameter', 'INVALID_CALLBACK', 400);
        }

        // CSRF validation - check state parameter
        if (!req.session.pkce || req.session.pkce.state !== state) {
            logger.error('CSRF attack detected: state mismatch', {
                expected: req.session.pkce?.state,
                received: state
            });
            return res.error('Invalid state parameter. Possible CSRF attack.', 'CSRF_ERROR', 403);
        }

        const { codeVerifier, accountType } = req.session.pkce;

        // Exchange authorization code for tokens using PKCE
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code_verifier: codeVerifier // Complete PKCE flow
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Fetch user profile from Spotify
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const profile = profileResponse.data;

        // Store tokens in session (server-side only, NEVER in frontend)
        req.session[`${accountType}Account`] = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + (expires_in * 1000),
            profile: {
                id: profile.id,
                email: profile.email,
                displayName: profile.display_name,
                imageUrl: profile.images?.[0]?.url
            }
        };

        // Clear PKCE data (one-time use)
        delete req.session.pkce;

        // Store user in database
        await query(
            `INSERT INTO users (spotify_id, email, display_name, profile_image_url, account_type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (spotify_id) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         profile_image_url = EXCLUDED.profile_image_url,
         updated_at = NOW()`,
            [profile.id, profile.email, profile.display_name, profile.images?.[0]?.url, accountType]
        );

        logger.info('OAuth callback successful', {
            accountType,
            userId: profile.id,
            email: profile.email
        });

        return res.success({
            accountType,
            profile: req.session[`${accountType}Account`].profile
        });
    } catch (error) {
        logger.error('Callback error', {
            error: error.message,
            response: error.response?.data
        });

        if (error.response?.status === 400) {
            return res.error('Invalid authorization code', 'INVALID_CODE', 400);
        }

        return res.error('Failed to complete authentication', 'CALLBACK_ERROR', 500);
    }
});

/**
 * POST /auth/refresh
 * Refresh expired access token
 * Body: { accountType: 'old' | 'new' }
 */
router.post('/refresh', async (req, res) => {
    try {
        const { accountType } = req.body;

        if (!accountType || !['old', 'new'].includes(accountType)) {
            return res.error('Invalid account type', 'INVALID_ACCOUNT_TYPE', 400);
        }

        const account = req.session[`${accountType}Account`];

        if (!account?.refreshToken) {
            return res.error('No refresh token available. Please login again.', 'NO_REFRESH_TOKEN', 401);
        }

        // Request new access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: account.refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in, refresh_token } = tokenResponse.data;

        // Update session with new tokens
        req.session[`${accountType}Account`] = {
            ...account,
            accessToken: access_token,
            refreshToken: refresh_token || account.refreshToken, // Use new refresh token if provided
            expiresAt: Date.now() + (expires_in * 1000)
        };

        logger.info('Token refreshed successfully', { accountType });

        return res.success({ message: 'Token refreshed successfully' });
    } catch (error) {
        logger.error('Token refresh error', {
            error: error.message,
            response: error.response?.data
        });

        if (error.response?.status === 400) {
            return res.error('Invalid refresh token. Please login again.', 'INVALID_REFRESH_TOKEN', 401);
        }

        return res.error('Failed to refresh token', 'REFRESH_ERROR', 500);
    }
});

/**
 * GET /auth/status
 * Get current session status for both accounts
 */
router.get('/status', (req, res) => {
    const oldAccount = req.session.oldAccount;
    const newAccount = req.session.newAccount;

    return res.success({
        oldAccount: oldAccount ? {
            connected: true,
            profile: oldAccount.profile,
            expiresAt: oldAccount.expiresAt
        } : { connected: false },
        newAccount: newAccount ? {
            connected: true,
            profile: newAccount.profile,
            expiresAt: newAccount.expiresAt
        } : { connected: false }
    });
});

/**
 * POST /auth/logout
 * Destroy session and clear all tokens
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger.error('Logout error', { error: err.message });
            return res.error('Failed to logout', 'LOGOUT_ERROR', 500);
        }

        res.clearCookie('connect.sid');
        logger.info('User logged out successfully');

        return res.success({ message: 'Logged out successfully' });
    });
});

export default router;
