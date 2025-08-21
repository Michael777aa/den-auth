#!/bin/bash

# PRODUCTION

echo "Switching to the main branch and pulling the latest changes from Git..."
git reset --hard


echo "Installing dependencies..."

echo "Building the application..."
npm run build
echo "Starting the application..."

npm run start