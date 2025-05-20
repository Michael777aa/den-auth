// Social authentication API routes for Google, Kakao, and Naver, including user info and token refresh endpoints.
// 구글, 카카오, 네이버 소셜 인증 API 라우트와 사용자 정보, 토큰 갱신 엔드포인트 포함

import { FastifyInstance } from "fastify";
import {
  googleAuthorizeHandler,
  googleCallbackHandler,
  googleTokenHandler,
  kakaoAuthorizeHandler,
  kakaoCallbackHandler,
  kakaoTokenHandler,
  naverAuthorizeHandler,
  naverCallbackHandler,
  naverTokenHandler,
  refreshTokenHandler,
  userInfoHandler,
} from "./member.controller";

// Register authentication endpoints for each social provider
// 각 소셜 제공자에 대한 인증 엔드포인트 등록
const authRoutes = async (server: FastifyInstance) => {
  server.get("/google/authorize", googleAuthorizeHandler);
  server.get("/google/callback", googleCallbackHandler);
  server.post("/google/token", googleTokenHandler);

  server.get("/kakao/authorize", kakaoAuthorizeHandler);
  server.get("/kakao/callback", kakaoCallbackHandler);
  server.post("/kakao/token", kakaoTokenHandler);

  server.get("/naver/authorize", naverAuthorizeHandler);
  server.get("/naver/callback", naverCallbackHandler);
  server.post("/naver/token", naverTokenHandler);

  server.post("/refresh", refreshTokenHandler);
  server.get("/user", userInfoHandler);
};

export default authRoutes;
