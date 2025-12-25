#!/bin/sh
set -e

# Run migrations
echo "Running database migrations..."
bunx drizzle-kit migrate --config drizzle.config.prod.ts

# Start the server
echo "Starting server..."
bun run .output/server/index.mjs
