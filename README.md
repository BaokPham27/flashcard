# Flashcard Pro - MySQL Edition

A modern, feature-rich flashcard learning application built with Next.js and MySQL. Study efficiently with multiple learning modes, track your progress with XP and streaks, and share sets with the community.

## Features

- **User Authentication** - Secure signup/login with JWT tokens
- **Flashcard Management** - Create, edit, and delete flashcard sets
- **Study Modes** - Two learning approaches:
  - Study Mode: Flip through cards at your own pace
  - Test Mode: Quiz yourself with scoring
- **Progress Tracking** - XP points, streaks, and achievement system
- **Japanese Learning** - Specialized tools for Japanese language learners
- **Public Library** - Browse and copy community flashcard sets
- **Admin Dashboard** - Manage users and moderate content

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with local connection
- **Authentication**: JWT tokens with secure cookies
- **UI Components**: Shadcn/ui

## Prerequisites

- Node.js 18+ and npm/yarn
- MySQL Server running locally
- Git (optional)

## Setup Instructions

### 1. Create MySQL Database

First, create the flashcard database. Open MySQL client or use a GUI tool:

\`\`\`sql
CREATE DATABASE flashcard_db;
USE flashcard_db;
\`\`\`

Then run the schema file to create all tables:

\`\`\`bash
mysql -u root -p flashcard_db < scripts/001_init_schema.sql
\`\`\`

Or copy the contents of `scripts/001_init_schema.sql` and run it in your MySQL client.

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

or with yarn:

\`\`\`bash
yarn install
\`\`\`

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

\`\`\`bash
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=flashcard_db

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
\`\`\`

**Important**: Replace `your_mysql_password_here` with your actual MySQL password.

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

### 5. Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up" and create an account
3. Start creating flashcard sets!

## Project Structure

\`\`\`
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── sets/              # Flashcard set management
│   └── stats/             # User statistics
├── auth/                  # Authentication pages
├── dashboard/             # Main app pages
│   ├── sets/             # Flashcard management
│   ├── study/            # Study modes
│   ├── progress/         # Progress tracking
│   ├── library/          # Public library
│   └── japanese/         # Japanese learning
└── page.tsx              # Home page

lib/
├── db.ts                 # Database connection pool
├── auth.ts               # JWT authentication utilities
└── hash.ts               # Password hashing utilities

scripts/
└── 001_init_schema.sql   # Database schema
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Flashcard Sets
- `GET /api/sets` - Get user's sets
- `POST /api/sets` - Create new set
- `GET /api/sets/[id]` - Get set details
- `PUT /api/sets/[id]` - Update set
- `DELETE /api/sets/[id]` - Delete set

### Flashcards
- `GET /api/sets/[id]/cards` - Get cards in set
- `POST /api/sets/[id]/cards` - Add card
- `PUT /api/sets/[id]/cards/[cardId]` - Update card
- `DELETE /api/sets/[id]/cards/[cardId]` - Delete card

### Statistics
- `GET /api/stats` - Get user statistics
- `POST /api/study-session` - Track study session

## Database Schema

### Users Table
Stores user account information with authentication details.

### User Stats Table
Tracks learning progress including XP, cards studied, and streaks.

### Flashcard Sets Table
Contains user-created flashcard sets with metadata.

### Flashcards Table
Individual cards within a set with front/back content.

### Study Sessions Table
Records of completed study and test sessions with scores.

### Study Progress Table
Tracks individual card progress for spaced repetition (future feature).

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running: `mysql.server start` (macOS) or check Services (Windows)
- Verify credentials in `.env.local`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port 3000 Already in Use
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

### Database Schema Issues
- Drop and recreate database: `DROP DATABASE flashcard_db;`
- Re-run schema file from step 1

## Production Deployment

1. Update `.env` with production values
2. Change `JWT_SECRET` to a strong random key
3. Use a managed MySQL service (AWS RDS, Heroku Postgres, etc.)
4. Deploy to Vercel: `vercel deploy`

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the database schema in `scripts/001_init_schema.sql`
3. Check API endpoints documentation above
