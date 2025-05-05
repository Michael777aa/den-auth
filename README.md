# Car Washing Service API 🚗💦

Fastify backend with JWT authentication, OAuth integration.

## Features ✨

- **Authentication**
  - JWT with cookies (`@fastify/jwt`)
  - Email/password login
  - Kakao OAuth integration
  - Naver OAuth integration
- **MongoDB** database
- CORS enabled for mobile development
- Static file serving

## Environment Setup ⚙️

Create `.env` file in root directory:

```env
PORT=3000
SECRET_TOKEN=your_jwt_secret_here
REDIS_URL=your_redis_url
MONGO_URL=mongodb://your_mongo_connection
KAKAO_CLIENT_ID=your_kakao_id
KAKAO_REDIRECT_URI=http://localhost:3109/api/v1/auth/kakao/callback
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret
NAVER_REDIRECT_URI=http://localhost:3109/api/v1/auth/naver/callback
```

## Installation 🛠️

```bash
npm install
npm run dev
```

## API Endpoints 📡

### Authentication

| Endpoint                      | Method | Description                    |
| ----------------------------- | ------ | ------------------------------ |
| `/api/v1/auth/signup`         | POST   | Email/password registration    |
| `/api/v1/auth/login`          | POST   | Email/password login           |
| `/api/v1/auth/kakao`          | GET    | Kakao OAuth redirect           |
| `/api/v1/auth/kakao/callback` | GET    | Kakao callback handler         |
| `/api/v1/auth/naver`          | GET    | Naver OAuth redirect           |
| `/api/v1/auth/naver/callback` | GET    | Naver callback handler         |
| `/api/v1/auth/logout`         | POST   | Logout (requires auth)         |
| `/api/v1/auth/delete`         | POST   | Delete account (requires auth) |

### Member Management

| Endpoint              | Method | Description                      |
| --------------------- | ------ | -------------------------------- |
| `/api/v1/auth/update` | POST   | Update profile with image upload |

## React Native Integration 📱

### 1. Install required packages

```bash
npx expo install expo-secure-store axios
```

## Deployment 🚀

1. Production build:

```bash
npm run build
```

2. Start server:

```bash
npm start
```

## Postman Testing Collection

[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/your-collection-link)

## Project Structure 📂

```
/src
  /config
    config.ts        # Configuration files
  /enums
    member.enum.ts   # Enum definitions
  /libs
    /Errors          # Custom error classes
    common.ts        # Shared utilities
  /modules
    /Member
      Auth.service.ts      # Authentication service
      member.controller.ts # Route handlers
      member.route.ts      # Route definitions
      member.schema.ts     # Validation schemas
      member.service.ts    # Business logic
  /types
    common.ts        # Common TypeScript types
    fastify.d.ts     # Fastify type extensions
  /utils
    uploader.ts      # File upload utilities
  /uploads           # Uploaded files storage
  app.ts             # Fastify application setup
  server.ts          # Server entry point
```

## Troubleshooting 🔧

- **CORS Issues**: Ensure correct origin in `cors` plugin
- **OAuth Failures**: Verify redirect URIs match provider settings
