import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'REDIRECT_URI',
    'SESSION_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'FRONTEND_URL'
];

export function validateEnv() {
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('\n❌ FATAL ERROR: Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        console.error('See .env.example for reference.\n');
        process.exit(1);
    }

    // Validate SESSION_SECRET length
    if (process.env.SESSION_SECRET.length < 32) {
        console.error('\n❌ FATAL ERROR: SESSION_SECRET must be at least 32 characters long for security.');
        console.error('Current length:', process.env.SESSION_SECRET.length);
        process.exit(1);
    }

    console.log('✅ All environment variables validated successfully');
}
