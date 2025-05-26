"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = exports.userInfoHandler = exports.naverTokenHandler = exports.naverCallbackHandler = exports.naverAuthorizeHandler = exports.kakaoTokenHandler = exports.kakaoCallbackHandler = exports.kakaoAuthorizeHandler = exports.googleTokenHandler = exports.googleCallbackHandler = exports.googleAuthorizeHandler = void 0;
const member_service_1 = require("./member.service");
const constants_1 = require("../../libs/utils/constants");
const constants_2 = require("../../libs/utils/constants");
const uuid_1 = require("uuid");
let jose;
(async () => {
    jose = await Promise.resolve().then(() => __importStar(require("jose")));
})();
/**
  By centralizing all social authentication logic in a single controller,
  this approach reduces code duplication, simplifies debugging and maintenance,
  enhances scalability for adding more providers in the future, ensures a consistent API structure,
  and promotes better team collaboration by making the authentication flow transparent and organized.

  모든 소셜 인증 로직을 하나의 컨트롤러로 통합함으로써, 코드 중복을 줄이고 디버깅과 유지보수를 단순화하며,
  향후 새로운 소셜 제공자 추가 시 확장성을 높이고, 일관된 API 구조를 보장하며,
  인증 플로우가 투명하고 체계적으로 관리되어 팀 협업도 더욱 원활하게 만들 수 있습니다.
 */
const memberService = new member_service_1.MemberService();
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
const googleAuthorizeHandler = async (request, reply) => {
    if (!constants_1.GOOGLE_CLIENT_ID) {
        return reply.status(500).send({ error: "GOOGLE_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, constants_1.BASE_URL);
    const stateParam = url.searchParams.get("state");
    let platform;
    const redirectUri = url.searchParams.get("redirect_uri");
    if (redirectUri === constants_1.APP_SCHEME) {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const state = platform + "|" + stateParam;
    const params = new URLSearchParams({
        client_id: constants_1.GOOGLE_CLIENT_ID,
        redirect_uri: constants_1.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid profile email",
        state,
        prompt: "select_account",
    });
    return reply.redirect(`${constants_1.GOOGLE_AUTH_URL}?${params.toString()}`);
};
exports.googleAuthorizeHandler = googleAuthorizeHandler;
/**
 * Google OAuth: Handle callback after user consents.
 * 구글 인증: 사용자 동의 후 콜백 처리
 */
const googleCallbackHandler = async (request, reply) => {
    const { code, state: combinedPlatformAndState } = request.query;
    if (!combinedPlatformAndState) {
        return reply.status(400).send({ error: "Invalid state" });
    }
    const [platform, state] = combinedPlatformAndState.split("|");
    const outgoingParams = new URLSearchParams({
        code: code || "",
        state: state || "",
    });
    const redirectTo = platform === "web"
        ? `${constants_1.BASE_URL}?${outgoingParams.toString()}`
        : `${constants_1.APP_SCHEME}?${outgoingParams.toString()}`;
    return reply.redirect(redirectTo);
};
exports.googleCallbackHandler = googleCallbackHandler;
/**
 * Google OAuth: Exchange code for tokens and return JWTs.
 * 구글 인증: 코드로 토큰 교환 후 JWT 반환
 */
const googleTokenHandler = async (request, reply) => {
    const { code } = request.body;
    if (!code) {
        return reply.status(400).send({ error: "Missing authorization code" });
    }
    if (!constants_1.GOOGLE_CLIENT_ID || !constants_1.GOOGLE_CLIENT_SECRET) {
        return reply.status(400).send({
            error: "Error on google client | google secret | google redirect",
        });
    }
    try {
        const tokenRes = await fetch(constants_1.GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: constants_1.GOOGLE_CLIENT_ID,
                client_secret: constants_1.GOOGLE_CLIENT_SECRET,
                redirect_uri: constants_1.GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
                code,
            }),
        });
        const data = await tokenRes.json();
        if (!data.id_token) {
            return reply.status(400).send({ error: "Missing ID token from Google" });
        }
        const decoded = jose.decodeJwt(data.id_token);
        const userInfo = {
            ...decoded,
            provider: "google",
        };
        const { exp, ...userInfoWithoutExp } = userInfo;
        const sub = userInfo.sub;
        const issuedAt = Math.floor(Date.now() / 1000);
        const jti = (0, uuid_1.v4)();
        const accessToken = await new jose.SignJWT(userInfoWithoutExp)
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(constants_2.JWT_EXPIRATION_TIME)
            .setSubject(sub)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
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
            .setExpirationTime(constants_2.REFRESH_TOKEN_EXPIRY)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
        await memberService.findOrCreateSocialMember(userInfo);
        return reply.send({
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Google token error:", error);
        return reply.status(500).send({ error: "Failed to process Google login" });
    }
};
exports.googleTokenHandler = googleTokenHandler;
/**
 * Kakao OAuth: Redirect user to Kakao consent page.
 * 카카오 인증: 사용자에게 카카오 동의 페이지로 리디렉션
 */
const kakaoAuthorizeHandler = async (request, reply) => {
    if (!constants_1.KAKAO_CLIENT_ID) {
        return reply.status(500).send({ error: "KAKAO_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, constants_1.BASE_URL);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    let platform;
    if (redirectUri === constants_1.APP_SCHEME) {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const combinedState = platform + "|" + state;
    const params = new URLSearchParams({
        client_id: constants_1.KAKAO_CLIENT_ID,
        redirect_uri: constants_1.KAKAO_REDIRECT_URI,
        response_type: "code",
        state: combinedState,
        prompt: "select_account",
    });
    return reply.redirect(`${constants_1.KAKAO_AUTH_URL}?${params.toString()}`);
};
exports.kakaoAuthorizeHandler = kakaoAuthorizeHandler;
/**
 * Kakao OAuth: Handle callback after user consents.
 * 카카오 인증: 사용자 동의 후 콜백 처리
 */
const kakaoCallbackHandler = async (request, reply) => {
    const url = new URL(request.url, constants_1.BASE_URL);
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
    const redirectTo = platform === "web"
        ? `${constants_1.BASE_URL}?${outgoingParams.toString()}`
        : `${constants_1.APP_SCHEME}?${outgoingParams.toString()}`;
    return reply.redirect(redirectTo);
};
exports.kakaoCallbackHandler = kakaoCallbackHandler;
/**
 * Kakao OAuth: Exchange code for tokens and return JWTs.
 * 카카오 인증: 코드로 토큰 교환 후 JWT 반환
 */
const kakaoTokenHandler = async (request, reply) => {
    const { code } = request.body;
    if (!code) {
        return reply.status(400).send({ error: "Missing authorization code" });
    }
    if (!constants_1.KAKAO_CLIENT_ID || !constants_1.KAKAO_CLIENT_SECRET) {
        return reply
            .status(400)
            .send({ error: "Kakao client info not set in env" });
    }
    // Exchange code for access token
    const tokenResponse = await fetch(constants_1.KAKAO_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: constants_1.KAKAO_CLIENT_ID,
            client_secret: constants_1.KAKAO_CLIENT_SECRET,
            redirect_uri: constants_1.KAKAO_REDIRECT_URI,
            grant_type: "authorization_code",
            code,
        }),
    });
    const data = await tokenResponse.json();
    if (!data.access_token) {
        return reply.status(400).send({ error: "Missing access token from Kakao" });
    }
    const userResponse = await fetch(constants_1.KAKAO_USER_INFO_URL, {
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
    const userInfo = {
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
        .setExpirationTime(constants_2.JWT_EXPIRATION_TIME)
        .setSubject(userInfo.sub)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
    const refreshToken = await new jose.SignJWT({
        ...userInfo,
        jti,
        type: "refresh",
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(constants_2.REFRESH_TOKEN_EXPIRY)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
    return reply.send({
        accessToken,
        refreshToken,
    });
};
exports.kakaoTokenHandler = kakaoTokenHandler;
/**
 * Naver OAuth: Redirect user to Naver consent page.
 * 네이버 인증: 사용자에게 네이버 동의 페이지로 리디렉션
 */
const naverAuthorizeHandler = async (request, reply) => {
    if (!constants_1.NAVER_CLIENT_ID) {
        return reply.status(500).send({ error: "NAVER_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, constants_1.BASE_URL);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    let platform;
    if (redirectUri === constants_1.APP_SCHEME) {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const combinedState = platform + "|" + state;
    const params = new URLSearchParams({
        client_id: constants_1.NAVER_CLIENT_ID,
        redirect_uri: constants_1.NAVER_REDIRECT_URI,
        response_type: "code",
        state: combinedState,
    });
    return reply.redirect(`${constants_1.NAVER_AUTH_URL}?${params.toString()}`);
};
exports.naverAuthorizeHandler = naverAuthorizeHandler;
/**
 * Naver OAuth: Handle callback after user consents.
 * 네이버 인증: 사용자 동의 후 콜백 처리
 */
const naverCallbackHandler = async (request, reply) => {
    const url = new URL(request.url, constants_1.BASE_URL);
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
    const redirectTo = platform === "web"
        ? `${constants_1.BASE_URL}?${outgoingParams.toString()}`
        : `${constants_1.APP_SCHEME}?${outgoingParams.toString()}`;
    return reply.redirect(redirectTo);
};
exports.naverCallbackHandler = naverCallbackHandler;
/**
 * Naver OAuth: Exchange code for tokens and return JWTs.
 * 네이버 인증: 코드로 토큰 교환 후 JWT 반환
 */
const naverTokenHandler = async (request, reply) => {
    const { code } = request.body;
    if (!code) {
        return reply.status(400).send({
            error: "invalid_request",
            error_description: "Missing authorization code or state",
        });
    }
    if (!constants_1.NAVER_CLIENT_ID || !constants_1.NAVER_CLIENT_SECRET) {
        return reply.status(400).send({
            error: "Naver client info not set in env",
        });
    }
    // Exchange code for access token
    const tokenResponse = await fetch(constants_1.NAVER_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: constants_1.NAVER_CLIENT_ID,
            client_secret: constants_1.NAVER_CLIENT_SECRET,
            redirect_uri: constants_1.NAVER_REDIRECT_URI,
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
    const userResponse = await fetch(constants_1.NAVER_USER_INFO_URL, {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
    });
    const userResponseData = await userResponse.json();
    const userData = userResponseData?.response;
    const userInfo = {
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
        .setExpirationTime(constants_2.JWT_EXPIRATION_TIME)
        .setSubject(userInfo.sub)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
    const refreshToken = await new jose.SignJWT({
        ...userInfo,
        jti,
        type: "refresh",
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(constants_2.REFRESH_TOKEN_EXPIRY)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
    return reply.send({
        accessToken,
        refreshToken,
    });
};
exports.naverTokenHandler = naverTokenHandler;
/**
 * Get user info from access token.
 * 액세스 토큰에서 사용자 정보 조회
 */
const userInfoHandler = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: "Not authenticated" });
        }
        const token = authHeader.split(" ")[1];
        try {
            const verified = await jose.jwtVerify(token, new TextEncoder().encode(constants_2.JWT_SECRET));
            return reply.send({ ...verified.payload });
        }
        catch (error) {
            return reply.status(401).send({ error: "Invalid token" });
        }
    }
    catch (error) {
        console.error("Session error:", error);
        return reply.status(500).send({ error: "Server error" });
    }
};
exports.userInfoHandler = userInfoHandler;
/**
 * Refresh access and refresh tokens.
 * 액세스 및 리프레시 토큰 갱신
 */
const refreshTokenHandler = async (request, reply) => {
    try {
        let refreshToken = null;
        const contentType = request.headers["content-type"] || "";
        if (contentType.includes("application/json")) {
            refreshToken = request.body.refreshToken || null;
        }
        else if (contentType.includes("application/x-www-form-urlencoded")) {
            refreshToken = request.body.refreshToken || null;
        }
        if (!refreshToken) {
            const authHeader = request.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const accessToken = authHeader.split(" ")[1];
                try {
                    const decoded = await jose.jwtVerify(accessToken, new TextEncoder().encode(constants_2.JWT_SECRET));
                    const userInfo = decoded.payload;
                    const issuedAt = Math.floor(Date.now() / 1000);
                    const newAccessToken = await new jose.SignJWT({ ...userInfo })
                        .setProtectedHeader({ alg: "HS256" })
                        .setExpirationTime(constants_2.JWT_EXPIRATION_TIME)
                        .setSubject(userInfo.sub)
                        .setIssuedAt(issuedAt)
                        .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
                    return reply.send({
                        accessToken: newAccessToken,
                    });
                }
                catch {
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
            decoded = await jose.jwtVerify(refreshToken, new TextEncoder().encode(constants_2.JWT_SECRET));
        }
        catch (error) {
            if (error.code === "ERR_JWT_EXPIRED" ||
                error instanceof jose.errors.JWTExpired) {
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
        const jti = (0, uuid_1.v4)();
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
            .setExpirationTime(constants_2.JWT_EXPIRATION_TIME)
            .setSubject(sub)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
        // New refresh token
        const newRefreshToken = await new jose.SignJWT({
            ...userInfo,
            jti,
            type: "refresh",
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(constants_2.REFRESH_TOKEN_EXPIRY)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(constants_2.JWT_SECRET));
        return reply.send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        console.error("Refresh error:", error);
        return reply.status(500).send({ error: "Failed to refresh token" });
    }
};
exports.refreshTokenHandler = refreshTokenHandler;
//# sourceMappingURL=member.controller.js.map