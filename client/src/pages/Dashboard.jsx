import React, { useState, useEffect } from 'react';
import { getSessionStatus, logout } from '../services/spotifyAuth';
import { fetchAllLikedSongs, addTracksInBatches } from '../services/spotifyAPI';
import { filterDuplicates } from '../utils/helpers';
import AccountCard from '../components/AccountCard';
import SongPreview from '../components/SongPreview';
import MigrationButton from '../components/MigrationButton';
import ProgressBar from '../components/ProgressBar';
import MigrationSummary from '../components/MigrationSummary';
import ParticleBackground from '../components/ParticleBackground';

export default function Dashboard() {
    const [oldAccount, setOldAccount] = useState(null);
    const [newAccount, setNewAccount] = useState(null);
    const [oldSongs, setOldSongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, added: 0, failed: 0, skipped: 0 });
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    // Load session status on mount
    useEffect(() => {
        loadSessionStatus();
    }, []);

    // Fetch songs when old account connects
    useEffect(() => {
        if (oldAccount?.connected && oldSongs.length === 0 && !loadingSongs) {
            fetchOldAccountSongs();
        }
    }, [oldAccount]);

    async function loadSessionStatus() {
        try {
            const status = await getSessionStatus();
            setOldAccount(status.oldAccount);
            setNewAccount(status.newAccount);
        } catch (error) {
            console.error('Failed to load session status:', error);
        }
    }

    async function fetchOldAccountSongs() {
        setLoadingSongs(true);
        setError(null);
        try {
            const songs = await fetchAllLikedSongs('old', (progress) => {
                console.log(`Fetching: ${progress.current}/${progress.total}`);
            });
            setOldSongs(songs);
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            setError('Failed to fetch your liked songs. Please try refreshing the page.');
        } finally {
            setLoadingSongs(false);
        }
    }

    async function startMigration() {
        if (!oldAccount?.connected || !newAccount?.connected || oldSongs.length === 0) {
            return;
        }

        setMigrating(true);
        setSummary(null);
        setError(null);
        const startTime = Date.now();

        try {
            // Fetch songs from new account for deduplication
            console.log('Fetching new account songs for deduplication...');
            const newSongs = await fetchAllLikedSongs('new');

            // Filter out duplicates
            const uniqueSongs = filterDuplicates(oldSongs, newSongs);
            const skippedCount = oldSongs.length - uniqueSongs.length;

            console.log(`Found ${uniqueSongs.length} unique songs to migrate (${skippedCount} already in new account)`);

            if (uniqueSongs.length === 0) {
                setSummary({
                    total: oldSongs.length,
                    added: 0,
                    skipped: skippedCount,
                    failed: 0,
                    duration: Date.now() - startTime,
                    failedTracks: []
                });
                setMigrating(false);
                return;
            }

            // Reset progress
            setProgress({
                current: 0,
                total: uniqueSongs.length,
                added: 0,
                failed: 0,
                skipped: skippedCount
            });

            // Add tracks in batches
            const trackIds = uniqueSongs.map(song => song.id);
            const result = await addTracksInBatches('new', trackIds, (batchProgress) => {
                setProgress({
                    current: batchProgress.current,
                    total: uniqueSongs.length,
                    added: batchProgress.added,
                    failed: batchProgress.failed,
                    skipped: skippedCount
                });
            });

            // Show summary
            setSummary({
                total: oldSongs.length,
                added: result.added,
                skipped: skippedCount,
                failed: result.failed,
                duration: Date.now() - startTime,
                failedTracks: result.failedTracks
            });

        } catch (error) {
            console.error('Migration error:', error);
            setError('Migration failed. Please try again.');
        } finally {
            setMigrating(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
            setOldAccount(null);
            setNewAccount(null);
            setOldSongs([]);
            setSummary(null);
            setProgress({ current: 0, total: 0, added: 0, failed: 0, skipped: 0 });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    function resetMigration() {
        setSummary(null);
        setProgress({ current: 0, total: 0, added: 0, failed: 0, skipped: 0 });
        setError(null);
        loadSessionStatus();
    }

    const hasConnectedAccounts = oldAccount?.connected || newAccount?.connected;

    return (
        <div className="min-h-screen bg-mesh relative overflow-hidden">
            {/* Particle background */}
            <ParticleBackground />

            {/* Noise overlay for premium feel */}
            <div className="noise-overlay absolute inset-0 pointer-events-none"></div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <header className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-spotify-green/30">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-bold">
                            <span className="gradient-text">Spotify Migration</span>
                        </h1>
                    </div>
                    <p className="text-spotify-lightgray text-lg max-w-xl mx-auto">
                        Transfer your liked songs from one Spotify account to another seamlessly and securely
                    </p>

                    {/* Logout button */}
                    {hasConnectedAccounts && (
                        <button
                            onClick={handleLogout}
                            className="mt-4 text-sm text-spotify-lightgray hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Disconnect All
                        </button>
                    )}
                </header>

                {/* Error message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center animate-fade-in">
                        <p className="text-red-400 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 text-sm text-spotify-lightgray hover:text-white transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Account Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <AccountCard
                        type="old"
                        account={oldAccount}
                        songCount={oldSongs.length}
                    />
                    <AccountCard
                        type="new"
                        account={newAccount}
                    />
                </div>

                {/* Song Preview */}
                {oldAccount?.connected && (
                    <div className="mb-8">
                        <SongPreview songs={oldSongs} loading={loadingSongs} />
                    </div>
                )}

                {/* Migration Button */}
                {!migrating && !summary && (
                    <MigrationButton
                        disabled={!oldAccount?.connected || !newAccount?.connected}
                        loading={migrating}
                        onClick={startMigration}
                        oldSongCount={oldSongs.length}
                        newConnected={newAccount?.connected}
                    />
                )}

                {/* Progress Bar */}
                {migrating && (
                    <div className="mb-8">
                        <ProgressBar progress={progress} />
                    </div>
                )}

                {/* Summary */}
                {summary && (
                    <div className="mb-8">
                        <MigrationSummary summary={summary} onReset={resetMigration} />
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center mt-16 pt-8 border-t border-white/10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6 text-spotify-lightgray text-sm">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Secure Connection
                            </span>
                            <span>•</span>
                            <span>OAuth 2.0 + PKCE</span>
                            <span>•</span>
                            <span>No Password Stored</span>
                        </div>

                        <p className="text-spotify-lightgray text-sm">
                            Made with ❤️ using React, Express, PostgreSQL & Redis
                        </p>

                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-spotify-lightgray hover:text-spotify-green transition-colors text-sm"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
