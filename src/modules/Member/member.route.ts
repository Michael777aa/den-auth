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
import { AuthService } from "./auth.service";

// Register authentication endpoints for each social provider
// 각 소셜 제공자에 대한 인증 엔드포인트 등록

export const authRoutes = async (server: FastifyInstance) => {
  server.post("/signup", async (request, reply) => {
    try {
      const { email, password, name, provider } = request.body as any;
      console.log("RESULT", request.body);

      const tokens = await AuthService.signup(email, password, name);
      return tokens;
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  server.post("/login", async (request, reply) => {
    try {
      const { email, password } = request.body as any;
      const tokens = await AuthService.login(email, password);
      return tokens;
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  });

  server.post("/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as any;
      const resetToken = await AuthService.requestPasswordReset(email);
      return { resetToken }; // For testing only. Replace with email sending logic.
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  server.post("/reset-password", async (request, reply) => {
    try {
      const { token, newPassword } = request.body as any;
      const tokens = await AuthService.resetPassword(token, newPassword);
      return tokens;
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Social Auth Routes
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
