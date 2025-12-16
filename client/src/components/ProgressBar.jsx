import React, { useMemo } from 'react';
import { formatTimeRemaining } from '../utils/helpers';

export default function ProgressBar({ progress }) {
    const { current, total, added, failed, skipped } = progress;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    // Calculate estimated time remaining
    const estimatedTimeRemaining = useMemo(() => {
        if (current === 0 || current >= total) return 0;
        const remainingTracks = total - current;
        const remainingBatches = Math.ceil(remainingTracks / 50);
        return remainingBatches * 0.3; // seconds
    }, [current, total]);

    // Calculate speed
    const tracksPerSecond = useMemo(() => {
        if (current === 0) return 0;
        return Math.round(50 / 0.3); // Approximate tracks per second
    }, [current]);

    return (
        <div className="glass-card p-8 animate-scale-in">
            {/* Header with animated icon */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-full mb-4 animate-pulse-glow">
                    <svg className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '2s' }} fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Migration in Progress</h3>
                <p className="text-spotify-lightgray">Please don't close this page</p>
            </div>

            {/* Main progress bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-spotify-lightgray font-medium">Progress</span>
                    <span className="text-3xl font-bold gradient-text">{percentage}%</span>
                </div>

                <div className="progress-bar h-5 relative">
                    <div
                        className="progress-fill absolute inset-0"
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 animate-shimmer"></div>
                    </div>

                    {/* Progress markers */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                        {[25, 50, 75].map(marker => (
                            <div
                                key={marker}
                                className={`w-0.5 h-3 rounded ${percentage >= marker ? 'bg-white/30' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Status text */}
            <div className="text-center mb-8 space-y-2">
                <p className="text-lg">
                    Processing track <span className="text-white font-bold text-xl">{current.toLocaleString()}</span> of{' '}
                    <span className="text-white font-bold text-xl">{total.toLocaleString()}</span>
                </p>

                {estimatedTimeRemaining > 0 && (
                    <div className="flex items-center justify-center gap-2 text-spotify-lightgray">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Est. time remaining: <span className="text-white font-medium">{formatTimeRemaining(estimatedTimeRemaining)}</span></span>
                    </div>
                )}

                {tracksPerSecond > 0 && (
                    <p className="text-sm text-spotify-lightgray">
                        Speed: ~{tracksPerSecond} tracks/second
                    </p>
                )}
            </div>

            {/* Statistics grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card success">
                    <div className="text-4xl font-bold text-spotify-green mb-2">{added.toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-spotify-lightgray">
                        <svg className="w-5 h-5 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">{(skipped || 0).toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-spotify-lightgray">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        Skipped
                    </div>
                </div>

                <div className="stat-card error">
                    <div className="text-4xl font-bold text-red-400 mb-2">{failed.toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-spotify-lightgray">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Failed
                    </div>
                </div>
            </div>

            {/* Activity indicator */}
            <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="w-2 h-8 bg-spotify-green rounded-full"
                            style={{
                                animation: 'pulse 1s ease-in-out infinite',
                                animationDelay: `${i * 0.15}s`,
                                opacity: 0.3 + (i * 0.15)
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
