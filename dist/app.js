"use strict";
// Fastify server initialization with CORS and authentication routes
// CORS와 인증 라우트를 포함한 Fastify 서버 초기화
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const member_route_1 = __importDefault(require("./modules/Member/member.route"));
// Create Fastify instance (ignores trailing slashes in routes)
// Fastify 인스턴스 생성 (라우트의 끝 슬래시 무시)
const app = (0, fastify_1.default)({
    ignoreTrailingSlash: true,
});
// Register CORS and other plugins
// CORS 및 기타 플러그인 등록
async function registerPlugins() {
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
}
// Register authentication routes with a specific prefix
// 인증 라우트를 지정된 프리픽스와 함께 등록
function registerRoutes() {
    app.register(member_route_1.default, { prefix: "/api/v1/auth" });
    app.get("/", async (request, reply) => {
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
//# sourceMappingURL=app.js.map