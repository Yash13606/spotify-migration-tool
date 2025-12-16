import React from 'react';

export default function MigrationButton({ disabled, loading, onClick, oldSongCount, newConnected }) {
    const canMigrate = !disabled && oldSongCount > 0 && newConnected;

    return (
        <div className="text-center my-10 animate-scale-in">
            <button
                onClick={onClick}
                disabled={!canMigrate || loading}
                className={`
                    relative inline-flex items-center justify-center
                    text-xl font-bold px-12 py-6 rounded-full
                    transition-all duration-500 ease-out
                    overflow-hidden group
                    ${canMigrate && !loading
                        ? 'bg-gradient-to-r from-spotify-green via-emerald-400 to-spotify-green bg-[length:200%_100%] hover:bg-right text-white shadow-[0_0_40px_rgba(29,185,84,0.4)] hover:shadow-[0_0_60px_rgba(29,185,84,0.6)] hover:scale-105'
                        : 'bg-spotify-gray text-spotify-lightgray cursor-not-allowed opacity-60'
                    }
                `}
            >
                {/* Animated background gradient */}
                {canMigrate && !loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}

                {loading ? (
                    <div className="flex items-center gap-3">
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Migrating Your Music...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 relative z-10">
                        <svg className="w-7 h-7 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>Start Migration</span>
                        <span className="text-2xl">🚀</span>
                    </div>
                )}
            </button>

            {/* Status messages */}
            <div className="mt-6 h-8">
                {!canMigrate && !loading && (
                    <div className="animate-fade-in flex items-center justify-center gap-2">
                        {!oldSongCount ? (
                            <>
                                <span className="text-yellow-400">⚠️</span>
                                <p className="text-spotify-lightgray">Connect your source account to get started</p>
                            </>
                        ) : !newConnected ? (
                            <>
                                <span className="text-yellow-400">⚠️</span>
                                <p className="text-spotify-lightgray">Connect your destination account to continue</p>
                            </>
                        ) : null}
                    </div>
                )}

                {canMigrate && !loading && (
                    <div className="animate-fade-in flex items-center justify-center gap-2">
                        <span className="text-spotify-green">✓</span>
                        <p className="text-spotify-lightgray">
                            Ready to migrate <span className="text-spotify-green font-semibold">{oldSongCount.toLocaleString()}</span> songs
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
