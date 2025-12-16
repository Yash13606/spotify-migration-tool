/**
 * Middleware to add standardized response methods to Express res object
 * All API responses follow the format:
 * Success: { success: true, data: {...}, timestamp: '...' }
 * Error: { success: false, error: 'message', code: 'ERROR_CODE', timestamp: '...' }
 */

export function responseWrapper(req, res, next) {
    /**
     * Send a successful response
     * @param {*} data - Data to send in response
     */
    res.success = (data) => {
        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    };

    /**
     * Send an error response
     * @param {string} message - Error message
     * @param {string} code - Error code (e.g., 'INVALID_TOKEN')
     * @param {number} statusCode - HTTP status code (default: 500)
     */
    res.error = (message, code = 'INTERNAL_ERROR', statusCode = 500) => {
        res.status(statusCode).json({
            success: false,
            error: message,
            code,
            timestamp: new Date().toISOString()
        });
    };

    next();
}
