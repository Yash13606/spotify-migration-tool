import React from 'react';
import { initiateLogin } from '../services/spotifyAuth';

export default function AccountCard({ type, account, songCount }) {
    const isOld = type === 'old';
    const title = isOld ? 'Source Account' : 'Destination Account';
    const description = isOld
        ? 'Connect the account with your liked songs'
        : 'Connect where you want to migrate';
    const icon = isOld ? '📤' : '📥';

    const handleConnect = async () => {
        try {
            await initiateLogin(type);
        } catch (error) {
            console.error('Failed to initiate login:', error);
            alert('Failed to connect account. Please try again.');
        }
    };

    if (!account || !account.connected) {
        return (
            <div className={`glass-card p-8 ${isOld ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-float">{icon}</div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
                    <p className="text-spotify-lightgray mb-6">{description}</p>

                    <div className="status-disconnected justify-center mb-6">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Not Connected</span>
                    </div>

                    <button
                        onClick={handleConnect}
                        className="btn-secondary w-full group"
                    >
                        <svg className="w-6 h-6 inline mr-2 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Connect with Spotify
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`glass-card p-8 ${isOld ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
            <div className="flex items-start gap-5">
                {/* Profile Image with glow */}
                <div className="relative">
                    <div className="absolute inset-0 bg-spotify-green/30 blur-xl rounded-full"></div>
                    <img
                        src={account.profile.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(account.profile.displayName || 'User') + '&background=1DB954&color=fff'}
                        alt={account.profile.displayName}
                        className="relative w-20 h-20 rounded-full border-3 border-spotify-green shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-spotify-green rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{icon}</span>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-white font-medium text-lg mb-2">{account.profile.displayName}</p>
                    {account.profile.email && (
                        <p className="text-spotify-lightgray text-sm mb-3">{account.profile.email}</p>
                    )}

                    <div className="status-connected text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Connected</span>
                    </div>

                    {/* Song count for old account */}
                    {songCount !== undefined && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-spotify-green/10 to-transparent rounded-xl border border-spotify-green/20">
                            <p className="text-sm text-spotify-lightgray mb-1">Liked Songs</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold gradient-text">{songCount.toLocaleString()}</span>
                                <span className="text-spotify-lightgray text-sm">tracks</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
