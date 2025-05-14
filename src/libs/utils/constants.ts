// utils/constants.ts
export const COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const COOKIE_MAX_AGE = 20; // 20 seconds
export const JWT_EXPIRATION_TIME = "20s"; // 20 seconds
export const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Refresh Token Constants
export const REFRESH_BEFORE_EXPIRY_SEC = 60; // Refresh token 1 minute before expiry

// OAuth Constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/google/callback`;
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// Kakao OAuth Constants
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
export const KAKAO_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/kakao/callback`;
export const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
export const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
export const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

// Naver OAuth Constants
export const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
export const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
export const NAVER_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/naver/callback`;
export const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
export const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
export const NAVER_USER_INFO_URL = "https://openapi.naver.com/v1/nid/me";

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const JWT_SECRET = process.env.JWT_SECRET;
