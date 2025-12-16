# 🎵 Spotify Liked Songs Migration Tool

A beautiful, full-stack web application that migrates liked songs from an old Spotify account to a new one. Built with React, Express, PostgreSQL, and Redis.

![Spotify Migration Tool](https://img.shields.io/badge/Spotify-Migration%20Tool-1DB954?style=for-the-badge&logo=spotify&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=flat-square&logo=redis)

## ✨ Features

- **Dual Account Authentication** - Connect both old and new Spotify accounts securely using OAuth 2.0 with PKCE
- **Fetch All Liked Songs** - Automatically fetches all liked songs with pagination support (1000+ songs)
- **Smart Deduplication** - Detects songs already in the new account to avoid duplicates
- **Real-time Progress** - Beautiful progress bar with live updates during migration
- **Rate Limit Handling** - Automatic retry with exponential backoff for API rate limits
- **Migration Report** - Detailed summary with export to JSON
- **Beautiful UI** - Premium glassmorphism design with smooth animations
- **Secure** - Session-based token storage, no tokens stored in browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Spotify Developer Account

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the details:
   - App Name: `Spotify Migration Tool`
   - App Description: `Migrate liked songs between accounts`
   - Redirect URI: `http://localhost:5173/callback`
4. Save your **Client ID** and **Client Secret**

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd spotify-migration

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:5173/callback
FRONTEND_URL=http://localhost:5173
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spotify_migration

# Redis
REDIS_URL=redis://localhost:6379

# Session (generate a random 32+ character string)
SESSION_SECRET=your_random_secret_here_minimum_32_characters_long
NODE_ENV=development
```

### 4. Set Up Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE spotify_migration;"

# Run the schema
psql -U postgres -d spotify_migration -f server/database/schema.sql
```

### 5. Start Redis

```bash
# Windows (if using Redis for Windows)
redis-server

# Linux/macOS
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 6. Run the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

Visit `http://localhost:5173` and start migrating! 🎉

## 📁 Project Structure

```
spotify-migration/
├── client/                    # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AccountCard.jsx
│   │   │   ├── ConfettiEffect.jsx
│   │   │   ├── MigrationButton.jsx
│   │   │   ├── MigrationSummary.jsx
│   │   │   ├── ParticleBackground.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── SongPreview.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Callback.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/         # API services
│   │   │   ├── spotifyAPI.js
│   │   │   └── spotifyAuth.js
│   │   ├── utils/            # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── config/
│   │   ├── database.js       # PostgreSQL config
│   │   ├── env-validator.js  # Environment validation
│   │   └── redis.js          # Redis config
│   ├── database/
│   │   └── schema.sql        # Database schema
│   ├── middleware/
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── responseWrapper.js
│   ├── routes/
│   │   ├── auth.js           # OAuth routes
│   │   └── spotify.js        # Spotify API routes
│   ├── utils/
│   │   ├── logger.js         # Winston logger
│   │   └── retryWithBackoff.js
│   ├── index.js              # Server entry
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔒 Security Features

- **OAuth 2.0 with PKCE** - Secure authorization flow
- **Server-side Token Storage** - Tokens stored in Redis sessions
- **CSRF Protection** - State parameter validation
- **Rate Limiting** - Protection against abuse
- **HTTP-only Cookies** - XSS protection
- **Secure Sessions** - Redis-backed sessions

## 🎨 UI/UX Features

- Glassmorphism design
- Particle background animation
- Smooth page transitions
- Real-time progress updates
- Confetti celebration on success
- Responsive design
- Dark mode optimized
- Loading skeletons

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - Initiate OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh access token
- `GET /auth/status` - Get session status
- `POST /auth/logout` - Logout and destroy session

### Spotify API
- `GET /api/spotify/me` - Get user profile
- `GET /api/spotify/tracks` - Fetch liked songs (paginated)
- `POST /api/spotify/add-tracks` - Add tracks to liked songs
- `POST /api/spotify/check-saved` - Check if tracks are saved

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Redis** - Session store
- **Winston** - Logging
- **express-rate-limit** - Rate limiting

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID | ✅ |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret | ✅ |
| `REDIRECT_URI` | OAuth redirect URI | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `SESSION_SECRET` | Session encryption key (32+ chars) | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

## 🐛 Troubleshooting

### "Missing environment variables" error
Make sure you've copied `.env.example` to `.env` and filled in all required values.

### "Failed to connect to PostgreSQL" error
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` is correct
- Make sure the database exists

### "Redis connection failed" error
- Ensure Redis is running on port 6379
- Check your `REDIS_URL` is correct

### "Invalid redirect URI" error
- Make sure the redirect URI in your Spotify app settings matches exactly
- Should be `http://localhost:5173/callback` for development

### Rate limit errors
The app handles rate limits automatically with exponential backoff. If you're seeing many rate limits, try increasing the delay between batches.

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

Made with ❤️ for music lovers who need to migrate their playlists
