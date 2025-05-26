"use strict";
// Social authentication API routes for Google, Kakao, and Naver, including user info and token refresh endpoints.
// 구글, 카카오, 네이버 소셜 인증 API 라우트와 사용자 정보, 토큰 갱신 엔드포인트 포함
Object.defineProperty(exports, "__esModule", { value: true });
const member_controller_1 = require("./member.controller");
// Register authentication endpoints for each social provider
// 각 소셜 제공자에 대한 인증 엔드포인트 등록
const authRoutes = async (server) => {
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
exports.default = authRoutes;
//# sourceMappingURL=member.route.js.map