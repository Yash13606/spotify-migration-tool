import axios from 'axios';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Set base URL from environment variable (for production)
const API_URL = import.meta.env.VITE_API_URL || '';
if (API_URL) {
    axios.defaults.baseURL = API_URL;
}

/**
 * Initiate OAuth login flow for an account
 * @param {'old' | 'new'} accountType - Type of account to connect
 */
export async function initiateLogin(accountType) {
    try {
        const response = await axios.post('/auth/login', { accountType });

        if (response.data.success) {
            // Redirect to Spotify authorization page
            window.location.href = response.data.data.authUrl;
        } else {
            throw new Error(response.data.error || 'Failed to initiate login');
        }
    } catch (error) {
        console.error('Login initiation error:', error);
        throw error.response?.data || error;
    }
}

/**
 * Handle OAuth callback
 * @param {string} code - Authorization code from Spotify
 * @param {string} state - State parameter for CSRF validation
 */
export async function handleCallback(code, state) {
    try {
        const response = await axios.get(`/auth/callback?code=${code}&state=${state}`);

        if (response.data.success) {
            return response.data.data; // { accountType, profile }
        } else {
            throw new Error(response.data.error || 'Callback failed');
        }
    } catch (error) {
        console.error('Callback error:', error);
        throw error.response?.data || error;
    }
}

/**
 * Get current session status for both accounts
 */
export async function getSessionStatus() {
    try {
        const response = await axios.get('/auth/status');

        if (response.data.success) {
            return response.data.data; // { oldAccount, newAccount }
        } else {
            throw new Error(response.data.error || 'Failed to get session status');
        }
    } catch (error) {
        console.error('Session status error:', error);
        return { oldAccount: { connected: false }, newAccount: { connected: false } };
    }
}

/**
 * Refresh access token for an account
 * @param {'old' | 'new'} accountType - Type of account to refresh
 */
export async function refreshToken(accountType) {
    try {
        const response = await axios.post('/auth/refresh', { accountType });

        if (response.data.success) {
            return true;
        } else {
            throw new Error(response.data.error || 'Token refresh failed');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error.response?.data || error;
    }
}

/**
 * Logout and destroy session
 */
export async function logout() {
    try {
        const response = await axios.post('/auth/logout');

        if (response.data.success) {
            return true;
        } else {
            throw new Error(response.data.error || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        throw error.response?.data || error;
    }
}
