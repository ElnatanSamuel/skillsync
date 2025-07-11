# SkillSync - Skill Tracking Application

SkillSync is a comprehensive application for tracking and improving your skills, with goal setting, session tracking, and analytics.

## Deployment Guide

### Prerequisites

- GitHub account
- Vercel account
- Free PostgreSQL database (options below)

## 1. Setting up a Free PostgreSQL Database

### Option 1: Neon.tech (Recommended)

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Create a new database
4. Get your connection string from the dashboard
5. Format: `postgresql://username:password@hostname:port/database?sslmode=require`

### Option 2: Supabase

1. Sign up at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Get the connection string
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### Option 3: Railway

1. Sign up at [railway.app](https://railway.app/)
2. Create a new PostgreSQL database
3. Get the connection string from the Connect tab
4. Format: `postgresql://postgres:password@hostname.railway.app:port/railway`

## 2. Database Setup

1. Add your connection string to the backend environment variables:

   ```
   DATABASE_URL="your-connection-string"
   ```

2. Push the schema to your database:
   ```bash
   cd server
   npx prisma migrate deploy
   ```

## 3. Backend Deployment (Vercel)

1. Push your code to GitHub

2. Create a new project on Vercel:

   - Import your GitHub repository
   - Set the root directory to `server`
   - Add the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: A secure random string for JWT tokens

3. Deploy your project

## 4. Frontend Deployment (Vercel)

1. Create a new project on Vercel:

   - Import the same GitHub repository
   - Set the root directory to `client`
   - Add the following environment variables:
     - `VITE_API_URL`: Your deployed backend URL with `/api` at the end
       Example: `https://skillsync-back.vercel.app/api`

2. Deploy your project

## 5. Update CORS Configuration (if needed)

If you're using custom domains, update the CORS configuration in `server/index.js` to include your frontend domain.

---

## Local Development

1. Clone the repository
2. Install dependencies:

   ```bash
   cd server && npm install
   cd client && npm install
   ```

3. Set up environment variables:

   - Create `.env` in the server directory with:

     ```
     DATABASE_URL="your-local-or-remote-database-url"
     JWT_SECRET="your-secret-key"
     ```

   - Create `.env.local` in the client directory with:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

4. Run the development servers:

   ```bash
   # In the server directory
   npm run dev

   # In the client directory
   npm run dev
   ```

5. Access the app at `http://localhost:5173`
