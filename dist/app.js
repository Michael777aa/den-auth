"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const path_1 = __importDefault(require("path"));
const member_route_1 = __importDefault(require("./modules/Member/member.route"));
const app = (0, fastify_1.default)({
    ignoreTrailingSlash: true,
});
// Register plugins
async function registerPlugins() {
    await app.register(cookie_1.default);
    await app.register(jwt_1.default, {
        secret: process.env.SECRET_TOKEN ||
            "2b1f5f9a7e78c47c925dd9ef8f81ad3d74c0e0a59f2378ea6f499d858d2fc6b4",
        cookie: {
            cookieName: "accessToken",
            signed: false,
        },
    });
    await app.register(multipart_1.default, {
        attachFieldsToBody: "keyValues",
        limits: { fileSize: 2000000 },
    });
    await app.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    await app.register(static_1.default, {
        root: path_1.default.join(__dirname, "../uploads"),
        prefix: "/public/",
    });
}
// Register routes
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