# #!/bin/bash

# # PRODUCTION

# echo "Switching to the main branch and pulling the latest changes from Git..."
# git reset --hard
# git checkout main
# git pull origin main

# echo "Installing dependencies..."
# npm install

# echo "Building the application..."
# npm run build
# npm run start

# echo "Starting the application in production mode using PM2..."
# pm2 start dist/server.js --name=car-washing-service --env production

# echo "Production deployment complete!"

# DEVELOPMENT (optional)
# echo "Switching to the development branch and pulling the latest changes from Git..."
# git reset --hard
# git checkout develop
# git pull origin develop

# echo "Installing dependencies..."
# npm install

# echo "Starting the application in development mode..."
# pm2 start "npm run start:prod" --name=car-washing-service-dev
#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."
git reset --hard
git checkout main
git pull origin main
# Install Node.js dependencies
echo "Installing dependencies..."
npm install --production

# Build the application
echo "Building the application..."
npm run build

# Check if PM2 is installed, install if not
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
fi

# Stop existing application if running
echo "Stopping existing application..."
pm2 delete car-washing-service || true

# Start the application
echo "Starting the application..."
pm2 start dist/server.js --name=car-washing-service --env production

# Save PM2 process list
pm2 save

# Set up PM2 startup script
echo "Setting up PM2 startup..."
pm2 startup
pm2 save

echo "Deployment completed successfully!"