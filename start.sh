#!/bin/bash

# Build the application if needed
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Start the Express server
echo "Starting API 510 Inspection App server..."
exec npx tsx server/index.ts