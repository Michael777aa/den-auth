#!/bin/bash

# PRODUCTION

echo "Switching to the main branch and pulling the latest changes from Git..."
git reset --hard
git checkout main
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Starting the application in production mode using PM2..."
pm2 start dist/server.js --name=car-washing-service --env production

# Start ngrok with PM2 on the desired port (change 3110 to your Fastify port)
echo "Starting ngrok tunnel using PM2..."
pm2 start "ngrok http 3112 --log=stdout" --name=ngrok-tunnel

echo "Production deployment complete!"
