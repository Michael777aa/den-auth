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
PORT=3109
MONGO_URL=mongodb+srv://abdullahjust777:yVh1Gj3lZ9urhccB@michael.vcnsjnq.mongodb.net/carwashing

```

## Installation 🛠️

```bash
npm install
npm run dev
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
  /enums
    member.enum.ts   # Enum definitions
  /libs
    common.ts        # Shared utilities
  /modules
    /Member
      member.controller.ts # Route handlers
      member.route.ts      # Route definitions
      member.schema.ts     # Validation schemas
      member.service.ts    # Business logic
  /types
    common.ts        # Common TypeScript types
  /utils
  app.ts             # Fastify application setup
  server.ts          # Server entry point
```

## Troubleshooting 🔧

- **CORS Issues**: Ensure correct origin in `cors` plugin
