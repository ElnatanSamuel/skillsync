# SkillSync Deployment Information

## Deployed URLs

- **Frontend**: https://skillsync-front.vercel.app
- **Backend**: https://skillsync-back.vercel.app

## Environment Setup

### Backend Environment Variables (Vercel)

Make sure these environment variables are set in your Vercel project settings for the backend:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `NODE_ENV`: "production"

### Frontend Environment Variables (Vercel)

Make sure these environment variables are set in your Vercel project settings for the frontend:

- `VITE_API_URL`: https://skillsync-back.vercel.app/api

## CORS Configuration

The backend is configured to accept requests from:

- http://localhost:5173 (local development)
- https://skillsync-client.vercel.app
- https://skillsync.vercel.app
- https://skillsync-front.vercel.app

If you need to add more origins, update the CORS configuration in `server/index.js`.

## Database Migration

When deploying updates to the database schema:

1. Update the schema in `server/prisma/schema.prisma`
2. Run locally: `npx prisma migrate dev --name your_migration_name`
3. Commit the changes
4. Redeploy the backend to Vercel (it will automatically run `prisma migrate deploy`)

## Troubleshooting

### API Connection Issues

If the frontend can't connect to the backend:

1. Check the browser console for CORS errors
2. Verify that the backend URL is correct in the frontend environment variables
3. Ensure the frontend domain is included in the CORS configuration

### Database Connection Issues

If the backend can't connect to the database:

1. Check the Vercel deployment logs
2. Verify the DATABASE_URL environment variable
3. Ensure the database is accessible from Vercel's servers

### React Build Issues

If you encounter build issues with React:

1. Check the dependency versions in package.json
2. Make sure react-toastify is properly installed
3. Verify Node.js version is compatible (v20.0.0 or higher)
