import React from 'react';
import { formatDuration } from '../utils/helpers';

export default function SongPreview({ songs, loading }) {
    if (loading) {
        return (
            <div className="glass-card p-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="animate-spin">
                        <svg className="w-6 h-6 text-spotify-green" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold">Fetching Your Liked Songs...</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 bg-spotify-gray/30 rounded-xl animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="w-12 h-12 bg-spotify-gray rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-spotify-gray rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-spotify-gray rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-spotify-gray rounded w-12"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!songs || songs.length === 0) {
        return null;
    }

    const displaySongs = songs.slice(0, 20);

    return (
        <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold">Your Liked Songs</h3>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-spotify-green/10 rounded-full border border-spotify-green/30">
                    <svg className="w-4 h-4 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-spotify-green font-bold">
                        {songs.length.toLocaleString()} tracks
                    </span>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {displaySongs.map((song, index) => (
                    <div
                        key={song.id || index}
                        className="song-card group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="relative">
                            <img
                                src={song.imageUrl || 'https://via.placeholder.com/48?text=♪'}
                                alt={song.album}
                                className="w-12 h-12 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate group-hover:text-spotify-green transition-colors">
                                {song.name}
                            </p>
                            <p className="text-sm text-spotify-lightgray truncate">{song.artists}</p>
                        </div>

                        <span className="text-sm text-spotify-lightgray font-mono">
                            {formatDuration(song.duration)}
                        </span>
                    </div>
                ))}
            </div>

            {songs.length > 20 && (
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-spotify-lightgray">
                        <span className="text-spotify-green font-semibold">+{(songs.length - 20).toLocaleString()}</span> more tracks to migrate
                    </p>
                </div>
            )}
        </div>
    );
}
