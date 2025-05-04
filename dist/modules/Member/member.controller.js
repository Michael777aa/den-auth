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
exports.initializeMemberController = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const Error_1 = __importStar(require("../../libs/Error"));
const config_1 = require("../../libs/config");
const Auth_service_1 = __importDefault(require("./Auth.service"));
const member_service_1 = __importDefault(require("./member.service"));
const member_schema_1 = require("./member.schema");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initializeMemberController = (fastify) => {
    const memberService = new member_service_1.default();
    const authService = new Auth_service_1.default(fastify);
    return {
        kakaoAuthRedirect: async (request, reply) => {
            const redirectURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
            reply.redirect(redirectURL);
        },
        kakaoCallback: async (request, reply) => {
            const { code } = request.query;
            try {
                console.log("Kakao auth");
                const tokenRes = await axios_1.default.post("https://kauth.kakao.com/oauth/token", new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: process.env.KAKAO_CLIENT_ID,
                    redirect_uri: process.env.KAKAO_REDIRECT_URI,
                    code: code,
                }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
                const accessToken = tokenRes.data.access_token;
                const userInfo = await axios_1.default.get("https://kapi.kakao.com/v2/user/me", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const kakaoData = userInfo.data;
                const kakaoId = kakaoData.id.toString();
                const memberEmail = kakaoData.kakao_account?.email;
                const memberNickname = kakaoData.kakao_account?.profile?.nickname || "Kakao User";
                const memberImage = kakaoData.kakao_account?.profile?.profile_image_url || "";
                let member = await member_schema_1.memberModel.findOne({
                    $or: [
                        { provider: "kakao", providerId: kakaoId },
                        { memberEmail: memberEmail },
                    ],
                });
                if (!member) {
                    member = await member_schema_1.memberModel.create({
                        provider: "kakao",
                        providerId: kakaoId,
                        memberEmail: memberEmail,
                        memberNickname: memberNickname,
                        memberImage: memberImage,
                    });
                }
                else if (member.provider !== "kakao") {
                    member.provider = "kakao";
                    member.providerId = kakaoId;
                    member.memberImage = memberImage;
                    await member.save();
                }
                const memberObj = member.toObject();
                const token = await authService.createToken(memberObj);
                reply
                    .status(Error_1.HttpCode.CREATED)
                    .send({ member: kakaoData, accessToken: token });
            }
            catch (err) {
                console.error("Error: SignUp", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        naverAuthRedirect: async (request, reply) => {
            const state = crypto_1.default.randomBytes(16).toString("hex");
            const scope = "name email";
            const redirectURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=${state}&scope=${encodeURIComponent(scope)}`;
            reply.redirect(redirectURL);
        },
        naverCallback: async (request, reply) => {
            const { code, state } = request.query;
            try {
                console.log("Naver auth");
                const tokenRes = await axios_1.default.get(`https://nid.naver.com/oauth2.0/token`, {
                    params: {
                        grant_type: "authorization_code",
                        client_id: process.env.NAVER_CLIENT_ID,
                        client_secret: process.env.NAVER_CLIENT_SECRET,
                        code,
                        state,
                    },
                });
                const accessToken = tokenRes.data.access_token;
                const userInfo = await axios_1.default.get(`https://openapi.naver.com/v1/nid/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const profile = userInfo.data.response;
                const naverId = profile.id;
                const memberEmail = profile.email;
                const memberName = profile.name || "Naver User";
                const memberImage = profile.profile_image || "";
                let member = await member_schema_1.memberModel.findOne({
                    $or: [
                        { provider: "naver", providerId: naverId },
                        { memberEmail: memberEmail },
                    ],
                });
                if (!member) {
                    member = await member_schema_1.memberModel.create({
                        provider: "naver",
                        providerId: naverId,
                        memberEmail: memberEmail || "email@naver.com",
                        memberNickname: memberName,
                        memberImage: memberImage,
                    });
                }
                else if (member.provider !== "naver") {
                    member.provider = "naver";
                    member.providerId = naverId;
                    member.memberImage = memberImage;
                    await member.save();
                }
                const memberObj = member.toObject();
                const token = await authService.createToken(memberObj);
                reply.status(Error_1.HttpCode.CREATED).send({
                    member: profile,
                    accessToken: token,
                });
            }
            catch (err) {
                console.error("Error: SignUp", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        googleAuthRedirect: async (request, reply) => {
            const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
            const options = {
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                client_id: process.env.GOOGLE_CLIENT_ID,
                access_type: "offline",
                response_type: "code",
                prompt: "consent",
                scope: [
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "https://www.googleapis.com/auth/userinfo.email",
                ].join(" "),
            };
            const qs = new URLSearchParams(options);
            const url = `${rootUrl}?${qs.toString()}`;
            reply.redirect(url);
        },
        googleCallback: async (request, reply) => {
            const { code } = request.query;
            try {
                console.log("Google auth");
                // 1. Get access token
                const tokenRes = await axios_1.default.post("https://oauth2.googleapis.com/token", new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                    grant_type: "authorization_code",
                }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
                const accessToken = tokenRes.data.access_token;
                // 2. Get user info
                const userInfo = await axios_1.default.get("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const googleData = userInfo.data;
                const googleId = googleData.id;
                const memberEmail = googleData.email;
                const memberNickname = googleData.name || "Google User";
                const memberImage = googleData.picture || "";
                // 3. Find or create user
                let member = await member_schema_1.memberModel.findOne({
                    $or: [
                        { provider: "google", providerId: googleId }, // Check by Google ID first
                        { memberEmail: memberEmail }, // Then check by email
                    ],
                });
                if (!member) {
                    // Create new user if doesn't exist
                    member = await member_schema_1.memberModel.create({
                        provider: "google",
                        providerId: googleId,
                        memberEmail: memberEmail,
                        memberNickname: memberNickname,
                        memberImage: memberImage,
                    });
                }
                else if (member.provider !== "google") {
                    // If user exists but with different provider, update with Google info
                    member.provider = "google";
                    member.providerId = googleId;
                    member.memberImage = memberImage;
                    await member.save();
                }
                // 4. Create JWT token
                const memberObj = member.toObject();
                const token = await authService.createToken(memberObj);
                reply
                    .status(Error_1.HttpCode.CREATED)
                    .send({ member: googleData, accessToken: token });
            }
            catch (err) {
                console.error("Error: SignUp", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        signup: async (request, reply) => {
            try {
                const input = request.body;
                const result = await memberService.signup(input);
                const token = await authService.createToken(result);
                reply.setCookie("accessToken", token, {
                    maxAge: config_1.AUTH_TIMER * 3600 * 1000,
                    httpOnly: true,
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                reply
                    .status(Error_1.HttpCode.CREATED)
                    .send({ member: result, accessToken: token });
            }
            catch (err) {
                console.error("Error: SignUp", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        login: async (request, reply) => {
            try {
                console.log("Login");
                const input = request.body;
                const result = await memberService.login(input);
                const token = await authService.createToken(result);
                reply.setCookie("accessToken", token, {
                    maxAge: config_1.AUTH_TIMER * 3600 * 1000,
                    httpOnly: true,
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                reply.status(Error_1.HttpCode.OK).send({ member: result, accessToken: token });
            }
            catch (err) {
                console.error("Error: Login", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        logout: async (request, reply) => {
            try {
                console.log("Logout");
                reply.clearCookie("accessToken", { path: "/" });
                reply.status(Error_1.HttpCode.OK).send({ logout: true });
            }
            catch (err) {
                console.error("Error: logout", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        // Add to the returned controller object
        verifyAuth: async (request, reply) => {
            try {
                await request.jwtVerify();
                request.member = request.user;
            }
            catch (err) {
                throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.NOT_AUTHENTICATED);
            }
        },
        deleteAccount: async (request, reply) => {
            try {
                console.log("deleteAccount");
                const member = request.member;
                const memberId = (0, config_1.shapeIntoMongooseObjectId)(member._id);
                await member_schema_1.memberModel.findByIdAndRemove(memberId);
                reply.clearCookie("accessToken", { path: "/" });
                reply.status(Error_1.HttpCode.OK).send({ deleted: true });
            }
            catch (err) {
                console.error("Error: deleteAccount", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
        updateMember: async (request, reply) => {
            try {
                const input = request.body;
                const member = request.member;
                const result = await memberService.updateMember(member, input);
                reply.status(Error_1.HttpCode.OK).send(result);
            }
            catch (err) {
                console.error("Error: updateMember", err);
                if (err instanceof Error_1.default)
                    reply.status(err.code).send(err);
                else
                    reply.status(Error_1.default.standard.code).send(Error_1.default.standard);
            }
        },
    };
};
exports.initializeMemberController = initializeMemberController;
//# sourceMappingURL=member.controller.js.map