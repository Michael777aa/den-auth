// Social authentication API routes for Google, Kakao, and Naver, including user info and token refresh endpoints.
import { FastifyInstance } from "fastify";
import {
  forgotPassword,
  googleAuthorizeHandler,
  googleCallbackHandler,
  googleTokenHandler,
  kakaoAuthorizeHandler,
  kakaoCallbackHandler,
  kakaoTokenHandler,
  login,
  naverAuthorizeHandler,
  naverCallbackHandler,
  naverTokenHandler,
  refreshTokenHandler,
  resetPassword,
  signup,
  userInfoHandler,
} from "./member.controller";

// Register authentication endpoints for each social provider
export const authRoutes = async (server: FastifyInstance) => {
  // Traditional Auth
  server.post("/signup", signup);
  server.post("/login", login);
  server.post("/forgot-password", forgotPassword);
  server.post("/reset-password", resetPassword);

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
