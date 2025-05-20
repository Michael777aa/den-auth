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
