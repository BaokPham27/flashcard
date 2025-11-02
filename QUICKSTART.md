# Quick Start Guide

Get Flashcard Pro running in 5 minutes!

## Step 1: Prerequisites Check

Make sure you have:
- Node.js 18+ installed: `node --version`
- MySQL running locally
- This project cloned/downloaded

## Step 2: Setup Database (2 minutes)

\`\`\`bash
# Open MySQL
mysql -u root -p

# In MySQL client, run:
CREATE DATABASE flashcard_db;
USE flashcard_db;
\`\`\`

Then paste the contents of `scripts/001_init_schema.sql` and execute it.

Exit MySQL with `exit`

## Step 3: Install & Configure (2 minutes)

\`\`\`bash
# Install dependencies
npm install

# Create .env.local file with your MySQL password
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=flashcard_db
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development" > .env.local
\`\`\`

Replace `your_password_here` with your actual MySQL password.

## Step 4: Run It! (1 minute)

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` and you're done!

## First Steps

1. **Sign Up** - Create a new account
2. **Create a Set** - Click "Create New Set"
3. **Add Cards** - Add flashcards with questions and answers
4. **Study** - Click "Start Studying" to practice
5. **Track Progress** - View your stats on the dashboard

## Useful Commands

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for lint errors
npm run lint
\`\`\`

## Database Troubleshooting

### Can't connect to MySQL
\`\`\`bash
# Start MySQL (macOS)
mysql.server start

# Check if running (Windows)
# Search for "Services" app and find MySQL
\`\`\`

### Need to reset database
\`\`\`bash
mysql -u root -p -e "DROP DATABASE flashcard_db;"
mysql -u root -p flashcard_db < scripts/001_init_schema.sql
\`\`\`

## Next Steps

- Explore the dashboard
- Create multiple flashcard sets
- Try both Study and Test modes
- Share sets publicly
- Check progress tracking

Enjoy learning!
