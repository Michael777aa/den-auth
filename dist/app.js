"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const member_route_1 = __importDefault(require("./modules/member/member.route"));
const app = (0, fastify_1.default)({
    ignoreTrailingSlash: true,
});
// Register plugins
async function registerPlugins() {
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
}
function registerRoutes() {
    app.register(member_route_1.default, { prefix: "/api/v1/auth" });
}
async function initApp() {
    await registerPlugins();
    registerRoutes();
    return app;
}
exports.default = initApp;
//# sourceMappingURL=app.js.map