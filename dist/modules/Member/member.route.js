"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const member_controller_1 = require("./member.controller");
// Register authentication endpoints for each social provider
const authRoutes = async (server) => {
    // Traditional Auth
    server.post("/signup", member_controller_1.signup);
    server.post("/login", member_controller_1.login);
    server.post("/forgot-password", member_controller_1.forgotPassword);
    server.post("/reset-password", member_controller_1.resetPassword);
    // Social Auth Routes
    server.get("/google/authorize", member_controller_1.googleAuthorizeHandler);
    server.get("/google/callback", member_controller_1.googleCallbackHandler);
    server.post("/google/token", member_controller_1.googleTokenHandler);
    server.get("/kakao/authorize", member_controller_1.kakaoAuthorizeHandler);
    server.get("/kakao/callback", member_controller_1.kakaoCallbackHandler);
    server.post("/kakao/token", member_controller_1.kakaoTokenHandler);
    server.get("/naver/authorize", member_controller_1.naverAuthorizeHandler);
    server.get("/naver/callback", member_controller_1.naverCallbackHandler);
    server.post("/naver/token", member_controller_1.naverTokenHandler);
    server.post("/refresh", member_controller_1.refreshTokenHandler);
    server.get("/user", member_controller_1.userInfoHandler);
};
exports.authRoutes = authRoutes;
//# sourceMappingURL=member.route.js.map