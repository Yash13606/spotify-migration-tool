import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '../services/spotifyAuth';

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        processCallback();
    }, []);

    async function processCallback() {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            setError(`Authorization failed: ${error}`);
            setStatus('error');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        if (!code || !state) {
            setError('Missing authorization code or state');
            setStatus('error');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        try {
            const result = await handleCallback(code, state);
            console.log('OAuth callback successful:', result);
            setStatus('success');

            // Redirect back to dashboard
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error('Callback processing error:', err);
            setError(err.error || 'Failed to complete authentication');
            setStatus('error');
            setTimeout(() => navigate('/'), 3000);
        }
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
                <div className="glass-card p-10 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-red-400">Authentication Failed</h2>
                    <p className="text-spotify-lightgray mb-6">{error}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-spotify-lightgray">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Redirecting to dashboard...
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
                <div className="glass-card p-10 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 mx-auto mb-6 bg-spotify-green/20 rounded-full flex items-center justify-center animate-bounce-in">
                        <svg className="w-10 h-10 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 gradient-text">Connected Successfully!</h2>
                    <p className="text-spotify-lightgray mb-6">Your Spotify account has been linked.</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-spotify-lightgray">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Redirecting...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
            <div className="glass-card p-10 max-w-md w-full text-center">
                {/* Spotify logo animation */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-spotify-green/30 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-spotify-green/30">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">Completing Authentication</h2>
                <p className="text-spotify-lightgray mb-8">Please wait while we connect your account...</p>

                {/* Loading dots */}
                <div className="flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-spotify-green rounded-full"
                            style={{
                                animation: 'bounce 1s ease-in-out infinite',
                                animationDelay: `${i * 0.15}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
