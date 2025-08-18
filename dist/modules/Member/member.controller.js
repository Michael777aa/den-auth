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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = exports.refreshTokenHandler = exports.userInfoHandler = exports.naverTokenHandler = exports.naverCallbackHandler = exports.naverAuthorizeHandler = exports.kakaoTokenHandler = exports.kakaoCallbackHandler = exports.kakaoAuthorizeHandler = exports.googleTokenHandler = exports.googleCallbackHandler = exports.googleAuthorizeHandler = void 0;
const member_service_1 = require("./member.service");
const jose = __importStar(require("jose"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const auth_service_1 = require("./auth.service");
// Tokens
const JWT_EXPIRATION_TIME = "20s"; // 20 seconds
const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days
const JWT_SECRET = process.env.JWT_SECRET;
// Google OAuth Constants
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
// Kakao OAuth Constants
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
// Naver OAuth Constants
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/auth/naver/callback`;
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_USER_INFO_URL = "https://openapi.naver.com/v1/nid/me";
// Environment Constants
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const memberService = new member_service_1.MemberService();
const authService = new auth_service_1.AuthService();
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
    if (!GOOGLE_CLIENT_ID) {
        return reply.status(500).send({ error: "GOOGLE_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, BASE_URL);
    const stateParam = url.searchParams.get("state");
    let platform;
    const redirectUri = url.searchParams.get("redirect_uri");
    if (redirectUri === "deendaily://") {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const state = platform + "|" + stateParam;
    const params = new URLSearchParams({
        client_id: "1036129451243-b075ldp36o545mk3232h6eg45gf38l5b.apps.googleusercontent.com",
        redirect_uri: "https://821a5e1d4274.ngrok-free.app/api/v1/auth/google/callback",
        response_type: "code",
        scope: "openid profile email",
        state,
        prompt: "select_account",
    });
    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
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
        ? `${BASE_URL}?${outgoingParams.toString()}`
        : `deendaily://?${outgoingParams.toString()}`;
    return reply.redirect(redirectTo);
};
exports.googleCallbackHandler = googleCallbackHandler;
/**
 * Google OAuth: Exchange code for tokens and return JWTs.
 * 구글 인증: 코드로 토큰 교환 후 JWT 반환
 */
const googleTokenHandler = async (request, reply) => {
    const { code } = request.body;
    console.log("CODEEE", code);
    if (!code) {
        return reply.status(400).send({ error: "Missing authorization code" });
    }
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return reply.status(400).send({
            error: "Error on google client | google secret | google redirect",
        });
    }
    try {
        const tokenRes = await axios_1.default.post(GOOGLE_TOKEN_URL, qs_1.default.stringify({
            client_id: "1036129451243-b075ldp36o545mk3232h6eg45gf38l5b.apps.googleusercontent.com",
            client_secret: "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",
            redirect_uri: "https://821a5e1d4274.ngrok-free.app/api/v1/auth/google/callback",
            grant_type: "authorization_code",
            code,
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const data = tokenRes.data;
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
    if (!KAKAO_CLIENT_ID) {
        return reply.status(500).send({ error: "KAKAO_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, BASE_URL);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    let platform;
    if (redirectUri === "deendaily://") {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const combinedState = platform + "|" + state;
    const params = new URLSearchParams({
        client_id: "2385ed6ce3415ea4324d08c9afe620d5",
        redirect_uri: "https://821a5e1d4274.ngrok-free.app/api/v1/auth/kakao/callback",
        response_type: "code",
        state: combinedState,
        prompt: "select_account",
    });
    return reply.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
};
exports.kakaoAuthorizeHandler = kakaoAuthorizeHandler;
/**
 * Kakao OAuth: Handle callback after user consents.
 * 카카오 인증: 사용자 동의 후 콜백 처리
 */
const kakaoCallbackHandler = async (request, reply) => {
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
    const redirectTo = platform === "web"
        ? `${BASE_URL}?${outgoingParams.toString()}`
        : `deendaily://?${outgoingParams.toString()}`;
    return reply.redirect(redirectTo);
};
exports.kakaoCallbackHandler = kakaoCallbackHandler;
/**
 * Kakao OAuth: Exchange code for tokens and return JWTs.
 * 카카오 인증: 코드로 토큰 교환 후 JWT 반환
 */
const kakaoTokenHandler = async (request, reply) => {
    const { code } = request.body;
    console.log("CODE", code);
    if (!code) {
        return reply.status(400).send({ error: "Missing authorization code" });
    }
    if (!KAKAO_CLIENT_ID || !KAKAO_CLIENT_SECRET) {
        return reply
            .status(400)
            .send({ error: "Kakao client info not set in env" });
    }
    // Exchange code for access token
    const tokenResponse = await axios_1.default.post("https://kauth.kakao.com/oauth/token", qs_1.default.stringify({
        client_id: "2385ed6ce3415ea4324d08c9afe620d5",
        client_secret: "x9TAFDhTYU2Pr31kGDQoXZ1Pah41tvYL",
        redirect_uri: "https://821a5e1d4274.ngrok-free.app/api/v1/auth/kakao/callback",
        grant_type: "authorization_code",
        code,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    console.log("token response", tokenResponse);
    const data = tokenResponse.data;
    if (!data.access_token) {
        return reply.status(400).send({ error: "Missing access token from Kakao" });
    }
    const userResponse = await axios_1.default.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
    });
    const userData = userResponse.data;
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
exports.kakaoTokenHandler = kakaoTokenHandler;
/**
 * Naver OAuth: Redirect user to Naver consent page.
 * 네이버 인증: 사용자에게 네이버 동의 페이지로 리디렉션
 */
const naverAuthorizeHandler = async (request, reply) => {
    if (!NAVER_CLIENT_ID) {
        return reply.status(500).send({ error: "NAVER_CLIENT_ID is not set" });
    }
    const url = new URL(request.url, BASE_URL);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    let platform;
    if (redirectUri === "deendaily://") {
        platform = "mobile";
    }
    else {
        return reply.status(400).send({ error: "Invalid redirect URI" });
    }
    const combinedState = platform + "|" + state;
    const params = new URLSearchParams({
        client_id: "AJcafV4oJQ2u0ptT1LeN",
        redirect_uri: "https://821a5e1d4274.ngrok-free.app/api/v1/auth/naver/callback",
        response_type: "code",
        state: combinedState,
    });
    return reply.redirect(`https://nid.naver.com/oauth2.0/authorize?${params.toString()}`);
};
exports.naverAuthorizeHandler = naverAuthorizeHandler;
/**
 * Naver OAuth: Handle callback after user consents.
 * 네이버 인증: 사용자 동의 후 콜백 처리
 */
const naverCallbackHandler = async (request, reply) => {
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
    const redirectTo = platform === "web"
        ? `${BASE_URL}?${outgoingParams.toString()}`
        : `deendaily://?${outgoingParams.toString()}`;
    console.log("REDIRECT", redirectTo);
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
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
        return reply.status(400).send({
            error: "Naver client info not set in env",
        });
    }
    // Exchange code for access token
    const tokenResponse = await axios_1.default.post(NAVER_TOKEN_URL, qs_1.default.stringify({
        client_id: "AJcafV4oJQ2u0ptT1LeN",
        client_secret: "x7C0aaMQEa",
        redirect_uri: NAVER_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    console.log("DATA", tokenResponse);
    const data = tokenResponse.data;
    if (!data.access_token) {
        return reply.status(400).send({
            error: "Missing access token from Naver",
        });
    }
    const userResponse = await axios_1.default.get(NAVER_USER_INFO_URL, {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
    });
    const userResponseData = userResponse.data;
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
            const verified = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
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
                    const decoded = await jose.jwtVerify(accessToken, new TextEncoder().encode(JWT_SECRET));
                    const userInfo = decoded.payload;
                    const issuedAt = Math.floor(Date.now() / 1000);
                    const newAccessToken = await new jose.SignJWT({ ...userInfo })
                        .setProtectedHeader({ alg: "HS256" })
                        .setExpirationTime(JWT_EXPIRATION_TIME)
                        .setSubject(userInfo.sub)
                        .setIssuedAt(issuedAt)
                        .sign(new TextEncoder().encode(JWT_SECRET));
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
            decoded = await jose.jwtVerify(refreshToken, new TextEncoder().encode(JWT_SECRET));
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
    }
    catch (error) {
        console.error("Refresh error:", error);
        return reply.status(500).send({ error: "Failed to refresh token" });
    }
};
exports.refreshTokenHandler = refreshTokenHandler;
const signup = async (request, reply) => {
    try {
        const { email, password, name } = request.body;
        const tokens = await authService.signup(email, password, name);
        return tokens;
    }
    catch (err) {
        return reply.status(400).send({ error: err.message });
    }
};
exports.signup = signup;
const login = async (request, reply) => {
    try {
        const { email, password } = request.body;
        const tokens = await authService.login(email, password);
        return tokens;
    }
    catch (err) {
        return reply.status(400).send({ error: err.message });
    }
};
exports.login = login;
const forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;
        const resetToken = await authService.requestPasswordReset(email);
        return { resetToken }; // For testing only. Replace with email sending logic.
    }
    catch (err) {
        return reply.status(400).send({ error: err.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (request, reply) => {
    try {
        const { code, newPassword } = request.body;
        const tokens = await authService.resetPassword(code, newPassword);
        return tokens;
    }
    catch (err) {
        return reply.status(400).send({ error: err.message });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=member.controller.js.map