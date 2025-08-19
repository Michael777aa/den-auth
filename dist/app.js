"use strict";
// Fastify server initialization with CORS, Helmet, Logging, and authentication routes
// CORS, Helmet, 로깅, 인증 라우트를 포함한 Fastify 서버 초기화
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const member_route_1 = require("./modules/Member/member.route");
const rateLimiting_1 = require("./libs/utils/rateLimiting");
// Create Fastify instance (ignores trailing slashes in routes)
// Fastify 인스턴스 생성 (라우트의 끝 슬래시 무시)
const app = (0, fastify_1.default)({
    ignoreTrailingSlash: true,
});
// Register plugins
async function registerPlugins() {
    // ✅ CORS
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    // ✅ Helmet (보안 헤더)
    await app.register(helmet_1.default, {
        contentSecurityPolicy: false, // 필요 시 CSP 설정 가능
    });
    await (0, rateLimiting_1.rateLimiter)(app);
}
// Register routes
// 라우트 등록
function registerRoutes() {
    app.register(member_route_1.authRoutes, { prefix: "/api/v1/auth" });
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
exports.default = initApp;
