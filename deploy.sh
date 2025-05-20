`#!/bin/bash

# PRODUCTION

echo "Switching to the main branch and pulling the latest changes from Git..."
git reset --hard
git checkout main
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build
npm run start

echo "Starting the application in production mode using PM2..."
pm2 start dist/server.js --name=car-washing-service --env production

echo "Production deployment complete!"

# DEVELOPMENT (optional)
# echo "Switching to the development branch and pulling the latest changes from Git..."
# git reset --hard
# git checkout develop
# git pull origin develop

# echo "Installing dependencies..."
# npm install

# echo "Starting the application in development mode..."
# pm2 start "npm run start:prod" --name=car-washing-service-dev
`