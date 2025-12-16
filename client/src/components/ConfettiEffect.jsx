import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = [
    '#1DB954', // Spotify Green
    '#1ed760', // Light Green
    '#FFD700', // Gold
    '#FF6B6B', // Coral
    '#4ECDC4', // Teal
    '#A855F7', // Purple
];

export default function ConfettiEffect({ trigger }) {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        if (trigger) {
            const newPieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: `${Math.random() * 0.5}s`,
                duration: `${2 + Math.random() * 2}s`,
                rotation: Math.random() * 360,
                size: 8 + Math.random() * 8
            }));
            setPieces(newPieces);

            // Clear confetti after animation
            const timer = setTimeout(() => {
                setPieces([]);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map(piece => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: piece.left,
                        backgroundColor: piece.color,
                        animationDelay: piece.delay,
                        animationDuration: piece.duration,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        transform: `rotate(${piece.rotation}deg)`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0'
                    }}
                />
            ))}
        </div>
    );
}
