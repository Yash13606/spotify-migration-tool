/**
 * Filter out duplicate tracks
 * @param {Array} oldTracks - Tracks from old account
 * @param {Array} newTracks - Tracks from new account
 * @returns {Array} Unique tracks not in new account
 */
export function filterDuplicates(oldTracks, newTracks) {
    const newTrackIds = new Set(newTracks.map(track => track.id));
    return oldTracks.filter(track => !newTrackIds.has(track.id));
}

/**
 * Create migration report
 * @param {Object} stats - Migration statistics
 * @returns {Object} Formatted report
 */
export function createMigrationReport(stats) {
    return {
        timestamp: new Date().toISOString(),
        totalTracks: stats.total,
        added: stats.added,
        skipped: stats.skipped,
        failed: stats.failed,
        duration: stats.duration,
        failedTracks: stats.failedTracks || []
    };
}

/**
 * Export migration report as JSON file
 * @param {Object} report - Migration report
 */
export function exportReportAsJSON(report) {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `spotify-migration-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Format duration in milliseconds to readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "3:45")
 */
export function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format time remaining
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time (e.g., "2m 30s")
 */
export function formatTimeRemaining(seconds) {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
}
