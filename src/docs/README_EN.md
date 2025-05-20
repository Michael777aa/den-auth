# ModernWash Backend Documentation

## Project Overview ✨

**ModernWash is a car washing service backend built with:**

- **Fastify:** High-performance web framework
- **MongoDB:** NoSQL database for user data
- **OAuth 2.0:** Social authentication (Google, Kakao, Naver)
- **JWT:** Token-based authentication

**Key features:**

- Social login integration
- Token management(access + refresh)
- User profile management
- Mobile-friendly authentication flows

**Project Structure**

```bash
SERVER/
├── dist/                     # Compiled JavaScript files
├── src/
│   ├── modules/
│   │   └── member/           # Member authentication module
│   │       ├── member.controller.ts  # Route handlers
│   │       ├── member.route.ts       # Route definitions
│   │       ├── member.schema.ts      # MongoDB schema
│   │       └── member.service.ts     # Business logic
│   ├── libs/
│   │   ├── enums/
│   │   │   └── member.enum.ts # Authentication provider enums
│   │   ├── types/
│   │   │   └── common.ts      # Common type definitions
│   │   └── utils/             # Utility functions
│   ├── app.ts                 # Fastify app initialization
│   └── server.ts              # Server entry point
├── docs/                      # Documentation
├── env                        # Environment variables
├── .gitignore
├── deploy.sh                  # Deployment script
├── jest.config.js             # Jest configuration
├── package.json
├── package-lock.json
├── README.md
├── run_django.py              # Django integration (if needed)
└── tsconfig.json              # TypeScript configuration
```

## Setup & Installation

**Prerequisites**

- Node.js v18+
- MongoDB Atlas account or local MongoDB
- OAuth credentials from providers

**Installation Steps**

1. Clone the repository:

```bash
git clone http://gitlab.inkjetai/Mike/car-services-backend-fastify.git
cd modernwash-backend

```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables
4. Run in development mode:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
npm start
```

## Configuration

**Environment Variables**

Create a `.env` file in the root directory with these variables:

```bash
PORT=3110
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
EXPO_PUBLIC_BASE_URL=https://yourdomain.com
EXPO_PUBLIC_SCHEME=yourapp://

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-secret

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-secret

# JWT
JWT_SECRET=your-jwt-secret-key
```

**OAuth Setup**

1. **Google:** Create credentials at Google Cloud Console

- Authrized redirect URI: `{BASE_URL}/api/v1/auth/google/callback`

2. **Kakao:** Register app at Kakao Developers

- Redirect URI: `{BASE_URL}/api/v1/auth/kakao/callback`

3. **Naver:** Register app at Naver Developers

- Callback URL: `{BASE_URL}/api/v1/auth/naver/callback`

## Authentication System

**Flow Overview**

1. User initiates login via provider (Google/Kakao/Naver)

2. Server redirects to provider's auth page

3. Provider redirects back with authorization code

4. Server exchanges code for tokens

5. Server issues JWT tokens to client

**Token Management**

- **Access Token:** Short-lived (20 seconds by default)

- **Refresh Token:** Long-lived (30 days by default)

- Token refresh endpoint available

**Mobile Support**

- Deep link handling via `APP_SCHEME`

- Platform detection in state parameter

## API Endpoints

Base URL: `https://yourdomain.com/api/v1/auth`

**Authentication Endpoints**

- `GET /google/authorize`: Initiate Google OAuth flow
- `GET /google/callback`: Google OAuth callback handler
- `POST /google/token`: Exchange code for JWT tokens
- `GET /kakao/authorize`: Initiate Kakao OAuth flow
- `GET /kakao/callback`: Kakao OAuth callback handler
- `POST /kakao/token`: Exchange code for JWT tokens
- `GET /naver/authorize`: Initiate Naver OAuth flow
- `GET /naver/callback`: Naver OAuth callback handler
- `POST /naver/token`: Exchange code for JWT tokens
- `POST /refresh`: Refresh access token
- `POST /user`: Get current user info

## Database Schema

**Member Collection**

```bash
{
  email: string,       // User's email address
  name: string,        // User's display name
  sub: string,         // Unique ID from provider
  picture?: string,    // Profile picture URL
  provider: string,    // 'google' | 'kakao' | 'naver'
  exp: number,         // Token expiration timestamp
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

Indexes:

- Unique compound index on `{provider: 1, sub:1}`

## Security

**Implemented Measures**

- CORS with strict origin control
- JWT signing with HS256 algorithm
- Short-lived access tokens
- Secure HTTP headers via Fastify Helment
- Environment variables for secrets
- MongoDB connection with strict query mode

**Best Practises**

1. **Never commit** `.env` files
2. Rotate JWT secrets periodically
3. Use HTTPS in production
4. Monitor for unusual token activity
5. Keep dependencies updated

## Deployment

**Production Build**

```bash
npm run build
```

**Deployment Script**

The `deploy.sh` script automates:

1. Pulling the latest code from the `main` branch
2. Installing dependencies
3. Building the application
4. Starting the application in production mode with PM2

**How to use:**

```bash
sh deploy.sh
sh ./deploy.sh
```

**Note:**

- Make sure PM2 is installed globally:

```bash
npm install -g pm2
```

## Troubleshooting

**Common Issues**

1. **MongoDB Connection Failed**

- Verify `MONGO_URL` is correct
- Check network access to MongoDB
- Ensure MongoDB instance is running

2. **OAuth Redirect Errors**

- Verify redirect URIs match exactly
- Check `BASE_URL` environment variable
- Ensure provider apps are properly configured

3. **JWT Validation Failures**

- Confirm `JWT_SECRET` matches
- Check token expiration
- Production logs are structured JSON
  **Logging**
- Fastify uses Pino for logging
- Development mode shows detailed logs
- Production logs are structured JSON
