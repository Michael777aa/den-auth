// member.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { MemberService } from "./member.service";
import {
  APP_SCHEME,
  BASE_URL,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URL,
  KAKAO_AUTH_URL,
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
  KAKAO_REDIRECT_URI,
  KAKAO_TOKEN_URL,
  KAKAO_USER_INFO_URL,
  NAVER_AUTH_URL,
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
  NAVER_TOKEN_URL,
  NAVER_USER_INFO_URL,
} from "../../libs/utils/constants";
import jose from "jose";
import {
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRY,
} from "../../libs/utils/constants";
import { v4 as uuidv4 } from "uuid";

/**
  By centralizing all social authentication logic in a single controller,
  this approach reduces code duplication, simplifies debugging and maintenance,
  enhances scalability for adding more providers in the future, ensures a consistent API structure,
  and promotes better team collaboration by making the authentication flow transparent and organized.

  모든 소셜 인증 로직을 하나의 컨트롤러로 통합함으로써, 코드 중복을 줄이고 디버깅과 유지보수를 단순화하며,
  향후 새로운 소셜 제공자 추가 시 확장성을 높이고, 일관된 API 구조를 보장하며,
  인증 플로우가 투명하고 체계적으로 관리되어 팀 협업도 더욱 원활하게 만들 수 있습니다.
 */
const memberService = new MemberService();
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
export const googleAuthorizeHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!GOOGLE_CLIENT_ID) {
    return reply.status(500).send({ error: "GOOGLE_CLIENT_ID is not set" });
  }
  const url = new URL(request.url, BASE_URL);
  const stateParam = url.searchParams.get("state");
  let platform;
  const redirectUri = url.searchParams.get("redirect_uri");
  if (redirectUri === APP_SCHEME) {
    platform = "mobile";
  } else {
    return reply.status(400).send({ error: "Invalid redirect URI" });
  }
  const state = platform + "|" + stateParam;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    state,
    prompt: "select_account",
  });
  return reply.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

/**
 * Google OAuth: Handle callback after user consents.
 * 구글 인증: 사용자 동의 후 콜백 처리
 */
export const googleCallbackHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { code, state: combinedPlatformAndState } = request.query as any;
  if (!combinedPlatformAndState) {
    return reply.status(400).send({ error: "Invalid state" });
  }
  const [platform, state] = combinedPlatformAndState.split("|");
  const outgoingParams = new URLSearchParams({
    code: code || "",
    state: state || "",
  });
  const redirectTo =
    platform === "web"
      ? `${BASE_URL}?${outgoingParams.toString()}`
      : `${APP_SCHEME}?${outgoingParams.toString()}`;

  return reply.redirect(redirectTo);
};

/**
 * Google OAuth: Exchange code for tokens and return JWTs.
 * 구글 인증: 코드로 토큰 교환 후 JWT 반환
 */
export const googleTokenHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { code } = request.body as any;

  if (!code) {
    return reply.status(400).send({ error: "Missing authorization code" });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return reply.status(400).send({
      error: "Error on google client | google secret | google redirect",
    });
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }),
    });
    const data = await tokenRes.json();
    if (!data.id_token) {
      return reply.status(400).send({ error: "Missing ID token from Google" });
    }

    const decoded = jose.decodeJwt(data.id_token) as any;
    const userInfo: any = {
      ...decoded,
      provider: "google",
    };
    const { exp, ...userInfoWithoutExp } = userInfo;
    const sub = userInfo.sub;
    const issuedAt = Math.floor(Date.now() / 1000);
    const jti = uuidv4();

    const accessToken = await new jose.SignJWT(userInfoWithoutExp)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new jose.SignJWT({
      sub,
      jti,
      type: "refresh",
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      email_verified: userInfo.email_verified,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    await memberService.findOrCreateSocialMember(userInfo);

    return reply.send({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google token error:", error);
    return reply.status(500).send({ error: "Failed to process Google login" });
  }
};

/**
 * Kakao OAuth: Redirect user to Kakao consent page.
 * 카카오 인증: 사용자에게 카카오 동의 페이지로 리디렉션
 */
export const kakaoAuthorizeHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!KAKAO_CLIENT_ID) {
    return reply.status(500).send({ error: "KAKAO_CLIENT_ID is not set" });
  }

  const url = new URL(request.url, BASE_URL);
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");

  let platform;
  if (redirectUri === APP_SCHEME) {
    platform = "mobile";
  } else {
    return reply.status(400).send({ error: "Invalid redirect URI" });
  }

  const combinedState = platform + "|" + state;

  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: "code",
    state: combinedState,
    prompt: "select_account",
  });

  return reply.redirect(`${KAKAO_AUTH_URL}?${params.toString()}`);
};

/**
 * Kakao OAuth: Handle callback after user consents.
 * 카카오 인증: 사용자 동의 후 콜백 처리
 */
export const kakaoCallbackHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const url = new URL(request.url, BASE_URL);

  const code = url.searchParams.get("code");
  const combinedPlatformAndState = url.searchParams.get("state");

  if (!combinedPlatformAndState) {
    return reply.status(400).send({ error: "Invalid state" });
  }

  const [platform, state] = combinedPlatformAndState.split("|");

  const outgoingParams = new URLSearchParams({
    code: code || "",
    state,
  });

  const redirectTo =
    platform === "web"
      ? `${BASE_URL}?${outgoingParams.toString()}`
      : `${APP_SCHEME}?${outgoingParams.toString()}`;

  return reply.redirect(redirectTo);
};

/**
 * Kakao OAuth: Exchange code for tokens and return JWTs.
 * 카카오 인증: 코드로 토큰 교환 후 JWT 반환
 */
export const kakaoTokenHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { code } = request.body as any;

  if (!code) {
    return reply.status(400).send({ error: "Missing authorization code" });
  }
  if (!KAKAO_CLIENT_ID || !KAKAO_CLIENT_SECRET) {
    return reply
      .status(400)
      .send({ error: "Kakao client info not set in env" });
  }

  // Exchange code for access token
  const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      client_secret: KAKAO_CLIENT_SECRET,
      redirect_uri: KAKAO_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    return reply.status(400).send({ error: "Missing access token from Kakao" });
  }

  const userResponse = await fetch(KAKAO_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  const userData = await userResponse.json();
  if (userData.error) {
    return reply
      .status(400)
      .send({ error: "Failed to fetch user info from Kakao" });
  }

  const kakaoAccount = userData.kakao_account;
  const profile = kakaoAccount?.profile;

  const userInfo: any = {
    sub: userData.id ? userData.id.toString() : "unknown",
    name: profile?.nickname || "Kakao User",
    email: kakaoAccount?.email || `${userData.id}@kakao.com`,
    picture: profile?.profile_image_url || "https://i.imgur.com/0LKZQYM.png",
    email_verified: kakaoAccount?.is_email_verified || false,
    provider: "kakao",
  };
  await memberService.findOrCreateSocialMember(userInfo);

  const issuedAt = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();

  const accessToken = await new jose.SignJWT(userInfo)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(userInfo.sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({
    ...userInfo,
    jti,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  return reply.send({
    accessToken,
    refreshToken,
  });
};

/**
 * Naver OAuth: Redirect user to Naver consent page.
 * 네이버 인증: 사용자에게 네이버 동의 페이지로 리디렉션
 */
export const naverAuthorizeHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!NAVER_CLIENT_ID) {
    return reply.status(500).send({ error: "NAVER_CLIENT_ID is not set" });
  }

  const url = new URL(request.url, BASE_URL);
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");

  let platform;
  if (redirectUri === APP_SCHEME) {
    platform = "mobile";
  } else {
    return reply.status(400).send({ error: "Invalid redirect URI" });
  }

  const combinedState = platform + "|" + state;

  const params = new URLSearchParams({
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    response_type: "code",
    state: combinedState,
  });

  return reply.redirect(`${NAVER_AUTH_URL}?${params.toString()}`);
};

/**
 * Naver OAuth: Handle callback after user consents.
 * 네이버 인증: 사용자 동의 후 콜백 처리
 */
export const naverCallbackHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const url = new URL(request.url, BASE_URL);
  const code = url.searchParams.get("code");
  const combinedPlatformAndState = url.searchParams.get("state");

  if (!combinedPlatformAndState) {
    return reply.status(400).send({ error: "Invalid state" });
  }

  const [platform, state] = combinedPlatformAndState.split("|");
  const outgoingParams = new URLSearchParams({
    code: code || "",
    state,
  });

  const redirectTo =
    platform === "web"
      ? `${BASE_URL}?${outgoingParams.toString()}`
      : `${APP_SCHEME}?${outgoingParams.toString()}`;

  return reply.redirect(redirectTo);
};

/**
 * Naver OAuth: Exchange code for tokens and return JWTs.
 * 네이버 인증: 코드로 토큰 교환 후 JWT 반환
 */
export const naverTokenHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { code } = request.body as any;

  if (!code) {
    return reply.status(400).send({
      error: "invalid_request",
      error_description: "Missing authorization code or state",
    });
  }

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return reply.status(400).send({
      error: "Naver client info not set in env",
    });
  }

  // Exchange code for access token
  const tokenResponse = await fetch(NAVER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      client_secret: NAVER_CLIENT_SECRET,
      redirect_uri: NAVER_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    return reply.status(400).send({
      error: "Missing access token from Naver",
    });
  }

  const userResponse = await fetch(NAVER_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  const userResponseData = await userResponse.json();
  const userData = userResponseData?.response;

  const userInfo: any = {
    sub: userData.id ? userData.id.toString() : "unknown",
    name: userData.name || "Naver User",
    email: userData.email || `${userData.id}@naver.com`,
    picture: userData.profile_image || "https://i.imgur.com/0LKZQYM.png",
    email_verified: userData.email_verified || false,
    provider: "naver",
  };
  await memberService.findOrCreateSocialMember(userInfo);

  const issuedAt = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();

  const accessToken = await new jose.SignJWT(userInfo)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(userInfo.sub)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({
    ...userInfo,
    jti,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  return reply.send({
    accessToken,
    refreshToken,
  });
};

/**
 * Get user info from access token.
 * 액세스 토큰에서 사용자 정보 조회
 */
export const userInfoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Not authenticated" });
    }
    const token = authHeader.split(" ")[1];

    try {
      const verified = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );

      return reply.send({ ...verified.payload });
    } catch (error) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Session error:", error);
    return reply.status(500).send({ error: "Server error" });
  }
};

/**
 * Refresh access and refresh tokens.
 * 액세스 및 리프레시 토큰 갱신
 */
export const refreshTokenHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    let refreshToken: string | null = null;
    const contentType = request.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      refreshToken = (request.body as any).refreshToken || null;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      refreshToken = (request.body as any).refreshToken || null;
    }

    if (!refreshToken) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.split(" ")[1];
        try {
          const decoded = await jose.jwtVerify(
            accessToken,
            new TextEncoder().encode(JWT_SECRET)
          );
          const userInfo = decoded.payload;
          const issuedAt = Math.floor(Date.now() / 1000);

          const newAccessToken = await new jose.SignJWT({ ...userInfo })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(JWT_EXPIRATION_TIME)
            .setSubject(userInfo.sub as string)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET));

          return reply.send({
            accessToken: newAccessToken,
          });
        } catch {
          return reply.status(401).send({
            error: "Authentication required - no valid refresh token",
          });
        }
      }
      return reply.status(401).send({
        error: "Authentication required - no refresh token",
      });
    }

    let decoded;
    try {
      decoded = await jose.jwtVerify(
        refreshToken,
        new TextEncoder().encode(JWT_SECRET)
      );
    } catch (error: any) {
      if (
        error.code === "ERR_JWT_EXPIRED" ||
        error instanceof jose.errors.JWTExpired
      ) {
        return reply
          .status(401)
          .send({ error: "Refresh token expired, please sign in again" });
      }
      return reply.status(401).send({ error: "Invalid refresh token" });
    }

    const payload = decoded.payload;
    if (payload.type !== "refresh") {
      return reply.status(401).send({ error: "Invalid token type" });
    }

    const sub = payload.sub;
    if (!sub) {
      return reply.status(401).send({ error: "Invalid token payload" });
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const jti = uuidv4();

    const userInfo = {
      ...payload,
      type: undefined,
      name: payload.name || "mobile-user",
      email: payload.email || "user@example.com",
      picture: payload.picture || "https://ui-avatars.com/api/?name=User",
    };

    // New access token
    const newAccessToken = await new jose.SignJWT(userInfo)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    // New refresh token
    const newRefreshToken = await new jose.SignJWT({
      ...userInfo,
      jti,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    return reply.send({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return reply.status(500).send({ error: "Failed to refresh token" });
  }
};
