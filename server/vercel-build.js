// This script runs before the Vercel build process
console.log("Running vercel-build.js...");

// Import environment variables
require("dotenv").config();

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Please set it in the Vercel environment variables."
  );
  process.exit(1);
}

console.log("Environment variables loaded successfully");

// Log that we're ready to proceed with Prisma commands
console.log("Ready to run Prisma commands...");

// The actual Prisma commands are run from the package.json scripts
