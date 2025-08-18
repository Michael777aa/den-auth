import { FastifyRequest, FastifyReply } from "fastify";
/**
 *
 * Social Authentication Controller for Google, Kakao, Naver
 * - Handles OAuth login, token exchange, user info retrieval, and token refresh.
 * - Supports mobile (deep link) flows.
 *
 * 구글, 카카오, 네이버 소셜 인증 컨트롤러
 * - OAuth 로그인, 토큰 발급, 사용자 정보 조회, 토큰 갱신 기능 포함
 * - 모바일(딥링크) 플로우 지원
 */
/**
 * Google OAuth: Redirect user to Google consent page.
 * 구글 인증: 사용자에게 구글 동의 페이지로 리디렉션
 */
export declare const googleAuthorizeHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Google OAuth: Handle callback after user consents.
 * 구글 인증: 사용자 동의 후 콜백 처리
 */
export declare const googleCallbackHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Google OAuth: Exchange code for tokens and return JWTs.
 * 구글 인증: 코드로 토큰 교환 후 JWT 반환
 */
export declare const googleTokenHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Kakao OAuth: Redirect user to Kakao consent page.
 * 카카오 인증: 사용자에게 카카오 동의 페이지로 리디렉션
 */
export declare const kakaoAuthorizeHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Kakao OAuth: Handle callback after user consents.
 * 카카오 인증: 사용자 동의 후 콜백 처리
 */
export declare const kakaoCallbackHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Kakao OAuth: Exchange code for tokens and return JWTs.
 * 카카오 인증: 코드로 토큰 교환 후 JWT 반환
 */
export declare const kakaoTokenHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Naver OAuth: Redirect user to Naver consent page.
 * 네이버 인증: 사용자에게 네이버 동의 페이지로 리디렉션
 */
export declare const naverAuthorizeHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Naver OAuth: Handle callback after user consents.
 * 네이버 인증: 사용자 동의 후 콜백 처리
 */
export declare const naverCallbackHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Naver OAuth: Exchange code for tokens and return JWTs.
 * 네이버 인증: 코드로 토큰 교환 후 JWT 반환
 */
export declare const naverTokenHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Get user info from access token.
 * 액세스 토큰에서 사용자 정보 조회
 */
export declare const userInfoHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
/**
 * Refresh access and refresh tokens.
 * 액세스 및 리프레시 토큰 갱신
 */
export declare const refreshTokenHandler: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<never>;
export declare const signup: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<{
  accessToken: string;
  refreshToken: string;
}>;
export declare const login: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<{
  streamToken: string;
  accessToken: string;
  refreshToken: string;
}>;
export declare const forgotPassword: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<{
  resetToken: {
    message: string;
  };
}>;
export declare const resetPassword: (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<{
  accessToken: string;
  refreshToken: string;
}>;
