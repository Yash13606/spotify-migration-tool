import { logger } from './logger.js';

/**
 * Retry a function with exponential backoff
 * Handles Spotify API rate limiting (429 responses)
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 5)
 * @param {number} options.baseDelay - Base delay in ms (default: 500)
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
    const { maxRetries = 5, baseDelay = 500 } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;

            // Handle rate limiting (429)
            if (error.response?.status === 429) {
                if (isLastAttempt) {
                    logger.error('Max retries reached for rate-limited request', {
                        attempt: attempt + 1,
                        maxRetries
                    });
                    throw error;
                }

                // Use Retry-After header if available, otherwise exponential backoff
                const retryAfter = error.response.headers['retry-after'];
                const delay = retryAfter
                    ? parseInt(retryAfter) * 1000
                    : baseDelay * Math.pow(2, attempt);

                logger.warn('Rate limited by Spotify API, retrying...', {
                    attempt: attempt + 1,
                    maxRetries,
                    delayMs: delay,
                    retryAfter: retryAfter || 'not provided'
                });

                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // Handle other errors
            if (isLastAttempt) {
                logger.error('Max retries reached', {
                    attempt: attempt + 1,
                    error: error.message
                });
                throw error;
            }

            // Exponential backoff for other errors
            const delay = baseDelay * Math.pow(2, attempt);
            logger.warn('Request failed, retrying...', {
                attempt: attempt + 1,
                maxRetries,
                delayMs: delay,
                error: error.message
            });

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
