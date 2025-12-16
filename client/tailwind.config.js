/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                spotify: {
                    green: '#1DB954',
                    black: '#191414',
                    darkgray: '#121212',
                    gray: '#282828',
                    lightgray: '#B3B3B3',
                    white: '#FFFFFF'
                },
                border: 'rgba(255, 255, 255, 0.1)'
            },
            borderWidth: {
                '3': '3px'
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-left': 'slideInLeft 0.6s ease-out',
                'slide-in-right': 'slideInRight 0.6s ease-out',
                'fade-in': 'fadeIn 0.3s ease-in',
                'scale-in': 'scaleIn 0.4s ease-out',
                'bounce-in': 'bounceIn 0.6s ease-out',
                'progress': 'progress 1s ease-in-out',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'celebrate': 'celebrate 0.6s ease-in-out'
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                slideInRight: {
                    '0%': { transform: 'translateX(30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                bounceIn: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                progress: {
                    '0%': { transform: 'scaleX(0)' },
                    '100%': { transform: 'scaleX(1)' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                celebrate: {
                    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
                    '25%': { transform: 'scale(1.1) rotate(-5deg)' },
                    '50%': { transform: 'scale(1.1) rotate(5deg)' },
                    '75%': { transform: 'scale(1.05) rotate(-2deg)' }
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-spotify': 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)'
            }
        },
    },
    plugins: [],
}
