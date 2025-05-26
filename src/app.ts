// Fastify server initialization with CORS and authentication routes
// CORS와 인증 라우트를 포함한 Fastify 서버 초기화

import fastify from "fastify";
import cors from "@fastify/cors";
import memberRoutes from "./modules/Member/member.route";

// Create Fastify instance (ignores trailing slashes in routes)
// Fastify 인스턴스 생성 (라우트의 끝 슬래시 무시)
const app = fastify({
  ignoreTrailingSlash: true,
});

// Register CORS and other plugins
// CORS 및 기타 플러그인 등록
async function registerPlugins() {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
}

// Register authentication routes with a specific prefix
// 인증 라우트를 지정된 프리픽스와 함께 등록
function registerRoutes() {
  app.register(memberRoutes, { prefix: "/api/v1/auth" });
}

// Initialize and return the Fastify app
// Fastify 앱을 초기화하여 반환
async function initApp() {
  await registerPlugins();
  registerRoutes();
  return app;
}

export default initApp;
