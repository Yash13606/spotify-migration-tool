import React, { useEffect, useState } from 'react';
import { exportReportAsJSON } from '../utils/helpers';
import ConfettiEffect from './ConfettiEffect';

export default function MigrationSummary({ summary, onReset }) {
    const { added, skipped, failed, total, duration, failedTracks } = summary;
    const [showConfetti, setShowConfetti] = useState(false);

    const successRate = total > 0 ? Math.round((added / total) * 100) : 0;
    const isSuccess = added > 0 && failed === 0;

    useEffect(() => {
        // Trigger confetti on successful migration
        if (isSuccess) {
            setShowConfetti(true);
        }
    }, [isSuccess]);

    const handleExport = () => {
        const report = {
            timestamp: new Date().toISOString(),
            totalTracks: total,
            added,
            skipped: skipped || 0,
            failed,
            duration,
            failedTracks: failedTracks || []
        };
        exportReportAsJSON(report);
    };

    const formatDuration = (ms) => {
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) return `${seconds} seconds`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <>
            <ConfettiEffect trigger={showConfetti} />

            <div className="glass-card p-8 animate-bounce-in">
                {/* Success header */}
                <div className="text-center mb-10">
                    <div className={`text-8xl mb-4 ${isSuccess ? 'animate-celebrate' : ''}`}>
                        {isSuccess ? '🎉' : failed > 0 ? '⚠️' : '✅'}
                    </div>
                    <h2 className="text-4xl font-bold mb-3">
                        {isSuccess ? (
                            <span className="gradient-text">Migration Complete!</span>
                        ) : failed > 0 ? (
                            'Migration Completed with Errors'
                        ) : (
                            'Migration Complete'
                        )}
                    </h2>
                    <p className="text-spotify-lightgray text-lg">
                        {isSuccess
                            ? 'Your music library has been successfully migrated!'
                            : 'Check the summary below for details'
                        }
                    </p>
                </div>

                {/* Main stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="stat-card">
                        <div className="text-4xl font-bold text-white mb-2">{total.toLocaleString()}</div>
                        <div className="text-sm text-spotify-lightgray">Total Tracks</div>
                    </div>

                    <div className="stat-card success">
                        <div className="text-4xl font-bold text-spotify-green mb-2">{added.toLocaleString()}</div>
                        <div className="flex items-center justify-center gap-1 text-sm text-spotify-lightgray">
                            <span>✅</span> Added
                        </div>
                    </div>

                    <div className="stat-card warning">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">{(skipped || 0).toLocaleString()}</div>
                        <div className="flex items-center justify-center gap-1 text-sm text-spotify-lightgray">
                            <span>⏭️</span> Skipped
                        </div>
                    </div>

                    <div className="stat-card error">
                        <div className="text-4xl font-bold text-red-400 mb-2">{failed.toLocaleString()}</div>
                        <div className="flex items-center justify-center gap-1 text-sm text-spotify-lightgray">
                            <span>❌</span> Failed
                        </div>
                    </div>
                </div>

                {/* Success rate progress */}
                <div className="mb-10 p-6 bg-gradient-to-r from-spotify-green/10 to-transparent rounded-2xl border border-spotify-green/20">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-medium text-spotify-lightgray">Success Rate</span>
                        <span className="text-4xl font-bold gradient-text">{successRate}%</span>
                    </div>
                    <div className="progress-bar h-4">
                        <div
                            className="progress-fill"
                            style={{ width: `${successRate}%` }}
                        />
                    </div>
                </div>

                {/* Duration */}
                {duration && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-spotify-gray/50 rounded-full">
                            <svg className="w-5 h-5 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-spotify-lightgray">
                                Completed in <span className="text-white font-semibold">{formatDuration(duration)}</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Failed tracks details */}
                {failed > 0 && failedTracks && failedTracks.length > 0 && (
                    <div className="mb-8 p-5 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h4 className="font-semibold text-red-400">Failed Tracks</h4>
                        </div>
                        <p className="text-sm text-spotify-lightgray mb-3">
                            Some tracks couldn't be added (possibly region-restricted or unavailable)
                        </p>
                        <div className="max-h-32 overflow-y-auto text-xs text-spotify-lightgray font-mono bg-black/30 rounded-lg p-3">
                            {failedTracks.slice(0, 10).map((trackId, i) => (
                                <div key={i} className="py-1 border-b border-white/5 last:border-0">
                                    Track ID: {trackId}
                                </div>
                            ))}
                            {failedTracks.length > 10 && (
                                <div className="py-2 font-semibold text-red-400">
                                    + {failedTracks.length - 10} more failed tracks
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Report
                    </button>

                    <button
                        onClick={onReset}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Start New Migration
                    </button>
                </div>

                {/* Fun message */}
                {isSuccess && (
                    <div className="mt-8 text-center">
                        <p className="text-spotify-lightgray text-sm">
                            🎧 Time to enjoy your music on your new account!
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
