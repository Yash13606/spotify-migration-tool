import React, { useMemo } from 'react';

export default function ParticleBackground() {
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 20}s`,
            size: `${2 + Math.random() * 4}px`,
            opacity: 0.1 + Math.random() * 0.3
        }));
    }, []);

    return (
        <div className="particles-bg">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: particle.left,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                        width: particle.size,
                        height: particle.size,
                        opacity: particle.opacity
                    }}
                />
            ))}
        </div>
    );
}
