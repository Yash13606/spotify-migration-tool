import axios from 'axios';

axios.defaults.withCredentials = true;

/**
 * Fetch all liked songs from an account with pagination
 * @param {'old' | 'new'} accountType - Account to fetch from
 * @param {Function} onProgress - Progress callback (current, total)
 */
export async function fetchAllLikedSongs(accountType, onProgress) {
    let allTracks = [];
    let offset = 0;
    const limit = 50;
    let total = 0;

    try {
        while (true) {
            const response = await axios.get('/api/spotify/tracks', {
                params: { accountType, offset, limit }
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch tracks');
            }

            const data = response.data.data;
            const tracks = data.items.map(item => ({
                id: item.track.id,
                name: item.track.name,
                artists: item.track.artists.map(a => a.name).join(', '),
                album: item.track.album.name,
                imageUrl: item.track.album.images[0]?.url,
                duration: item.track.duration_ms
            }));

            allTracks = allTracks.concat(tracks);
            total = data.total;

            // Call progress callback
            if (onProgress) {
                onProgress({ current: allTracks.length, total });
            }

            // Check if we have all tracks
            if (!data.next || allTracks.length >= total) {
                break;
            }

            offset += limit;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return allTracks;
    } catch (error) {
        console.error('Error fetching liked songs:', error);
        throw error.response?.data || error;
    }
}

/**
 * Add tracks to user's liked songs in batches
 * @param {'new'} accountType - Account to add tracks to
 * @param {string[]} trackIds - Array of track IDs
 * @param {Function} onProgress - Progress callback (current, total, added, failed)
 */
export async function addTracksInBatches(accountType, trackIds, onProgress) {
    const batchSize = 50;
    let added = 0;
    let failed = 0;
    const failedTracks = [];

    try {
        for (let i = 0; i < trackIds.length; i += batchSize) {
            const batch = trackIds.slice(i, i + batchSize);

            try {
                const response = await axios.post('/api/spotify/add-tracks', {
                    accountType,
                    trackIds: batch
                });

                if (response.data.success) {
                    added += batch.length;
                } else {
                    failed += batch.length;
                    failedTracks.push(...batch);
                }
            } catch (error) {
                console.error('Batch add error:', error);
                failed += batch.length;
                failedTracks.push(...batch);
            }

            // Call progress callback
            if (onProgress) {
                onProgress({
                    current: Math.min(i + batchSize, trackIds.length),
                    total: trackIds.length,
                    added,
                    failed
                });
            }

            // Delay between batches to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        return { added, failed, failedTracks };
    } catch (error) {
        console.error('Error adding tracks:', error);
        throw error.response?.data || error;
    }
}

/**
 * Check which tracks are already saved in an account
 * @param {'new'} accountType - Account to check
 * @param {string[]} trackIds - Array of track IDs (max 50)
 */
export async function checkSavedTracks(accountType, trackIds) {
    try {
        const response = await axios.post('/api/spotify/check-saved', {
            accountType,
            trackIds
        });

        if (response.data.success) {
            return response.data.data.saved; // Array of booleans
        } else {
            throw new Error(response.data.error || 'Failed to check saved tracks');
        }
    } catch (error) {
        console.error('Error checking saved tracks:', error);
        throw error.response?.data || error;
    }
}

/**
 * Get user profile
 * @param {'old' | 'new'} accountType - Account type
 */
export async function getUserProfile(accountType) {
    try {
        const response = await axios.get('/api/spotify/me', {
            params: { accountType }
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Failed to get profile');
        }
    } catch (error) {
        console.error('Error getting profile:', error);
        throw error.response?.data || error;
    }
}
