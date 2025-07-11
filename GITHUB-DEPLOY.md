# GitHub Deployment Steps

This guide will help you deploy your SkillSync application to GitHub, which can then be connected to Vercel for hosting.

## Prerequisites

- Git installed on your computer
- GitHub account

## Steps

1. Create a new GitHub repository at [github.com/new](https://github.com/new)

   - Name it "skillsync" or any name you prefer
   - Set it to Public or Private as desired
   - Do not initialize with README, .gitignore, or license

2. Initialize and push your local repository:

```bash
# Make sure you're in the root directory of your project
cd /path/to/skillsync

# Initialize git if you haven't already
git init

# Add all files to staging
git add .

# Commit changes
git commit -m "Initial commit"

# Add GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/skillsync.git

# Push to GitHub
git push -u origin main
# If your default branch is called "master" use:
# git push -u origin master
```

3. Verify that your code is now on GitHub by visiting your repository URL

## Setting Up Vercel Deployment

1. Go to [vercel.com](https://vercel.com/) and sign up/log in

2. Click "Add New..." → "Project"

3. Connect to your GitHub account if not already connected

4. Select the "skillsync" repository you just created

5. Configure the deployments:

### Backend Deployment

- Set the root directory to "server"
- Add environment variables:
  - `DATABASE_URL`: Your PostgreSQL connection string
  - `JWT_SECRET`: A secure random string

6. Deploy

### Frontend Deployment

- Create a new project in Vercel
- Select the same GitHub repository
- Set the root directory to "client"
- Add environment variables:
  - `VITE_API_URL`: Your deployed backend URL with "/api" at the end
    (e.g., "https://skillsync-server.vercel.app/api")

7. Deploy

## Verifying Deployment

1. Visit your frontend URL to ensure the application is working
2. Test login/signup functionality
3. Verify that all features work as expected

If you encounter any issues, check the Vercel deployment logs and make necessary adjustments to your configuration.
