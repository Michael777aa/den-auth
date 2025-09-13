// Fastify server initialization with CORS, Helmet, Logging, and authentication routes
// CORS, Helmet, 로깅, 인증 라우트를 포함한 Fastify 서버 초기화

import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { authRoutes } from "./modules/Member/member.route";
import { rateLimiter } from "./libs/utils/rateLimiting";

// Create Fastify instance (ignores trailing slashes in routes)
// Fastify 인스턴스 생성 (라우트의 끝 슬래시 무시)
const app = fastify();

// Register plugins
async function registerPlugins() {
  // ✅ CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // ✅ Helmet (보안 헤더)
  await app.register(helmet, {
    contentSecurityPolicy: false, // 필요 시 CSP 설정 가능
  });
  await rateLimiter(app);
}

// Register routes
// 라우트 등록
function registerRoutes() {
  app.register(authRoutes, { prefix: "/api/v1/auth" });

  app.get("/", async () => {
    return "successfully running deen_daily backend authentication";
  });
}

// Initialize and return the Fastify app
// Fastify 앱을 초기화하여 반환
async function initApp() {
  await registerPlugins();
  registerRoutes();
  return app;
}

export default initApp;
