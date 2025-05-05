import axios from "axios";
import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import Errors, { HttpCode, Message } from "../../libs/Error";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../../libs/types/member";
import { AUTH_TIMER, shapeIntoMongooseObjectId } from "../../libs/config";
import { FastifyInstance } from "fastify";
import AuthService from "./Auth.service";
import MemberService from "./member.service";
import { memberModel } from "./member.schema";
import dotenv from "dotenv";
dotenv.config();

export const initializeMemberController = (fastify: FastifyInstance) => {
  const memberService = new MemberService();
  const authService = new AuthService(fastify);

  return {
    kakaoAuthRedirect: async (request: FastifyRequest, reply: FastifyReply) => {
      const redirectURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
      reply.redirect(redirectURL);
    },

    kakaoCallback: async (request: FastifyRequest, reply: FastifyReply) => {
      const { code } = request.query as { code: string };

      try {
        console.log("Kakao auth");
        const tokenRes = await axios.post(
          "https://kauth.kakao.com/oauth/token",
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.KAKAO_CLIENT_ID!,
            redirect_uri: process.env.KAKAO_REDIRECT_URI!,
            code: code,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenRes.data.access_token;
        const userInfo = await axios.get("https://kapi.kakao.com/v2/user/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const kakaoData = userInfo.data;
        const kakaoId = kakaoData.id.toString();
        const memberEmail = kakaoData.kakao_account?.email;
        const memberNickname =
          kakaoData.kakao_account?.profile?.nickname || "Kakao User";
        const memberImage =
          kakaoData.kakao_account?.profile?.profile_image_url || "";

        let member = await memberModel.findOne({
          $or: [
            { provider: "kakao", providerId: kakaoId },
            { memberEmail: memberEmail },
          ],
        });

        if (!member) {
          member = await memberModel.create({
            provider: "kakao",
            providerId: kakaoId,
            memberEmail: memberEmail,
            memberNickname: memberNickname,
            memberImage: memberImage,
          });
        } else if (member.provider !== "kakao") {
          member.provider = "kakao";
          member.providerId = kakaoId;
          member.memberImage = memberImage;
          await member.save();
        }

        const memberObj: any = member.toObject();
        const token = await authService.createToken(memberObj);

        reply
          .status(HttpCode.CREATED)
          .send({ member: kakaoData, accessToken: token });
      } catch (err) {
        console.error("Error: SignUp", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    naverAuthRedirect: async (request: FastifyRequest, reply: FastifyReply) => {
      const state = crypto.randomBytes(16).toString("hex");
      const scope = "name email";

      const redirectURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${
        process.env.NAVER_CLIENT_ID
      }&redirect_uri=${
        process.env.NAVER_REDIRECT_URI
      }&state=${state}&scope=${encodeURIComponent(scope)}`;
      reply.redirect(redirectURL);
    },

    naverCallback: async (request: FastifyRequest, reply: FastifyReply) => {
      const { code, state } = request.query as { code: string; state: string };

      try {
        console.log("Naver auth");
        const tokenRes = await axios.get(
          `https://nid.naver.com/oauth2.0/token`,
          {
            params: {
              grant_type: "authorization_code",
              client_id: process.env.NAVER_CLIENT_ID!,
              client_secret: process.env.NAVER_CLIENT_SECRET!,
              code,
              state,
            },
          }
        );

        const accessToken = tokenRes.data.access_token;
        const userInfo = await axios.get(
          `https://openapi.naver.com/v1/nid/me`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const profile = userInfo.data.response;
        const naverId = profile.id;
        const memberEmail = profile.email;
        const memberName = profile.name || "Naver User";
        const memberImage = profile.profile_image || "";

        let member = await memberModel.findOne({
          $or: [
            { provider: "naver", providerId: naverId },
            { memberEmail: memberEmail },
          ],
        });

        if (!member) {
          member = await memberModel.create({
            provider: "naver",
            providerId: naverId,
            memberEmail: memberEmail || "email@naver.com",
            memberNickname: memberName,
            memberImage: memberImage,
          });
        } else if (member.provider !== "naver") {
          member.provider = "naver";
          member.providerId = naverId;
          member.memberImage = memberImage;
          await member.save();
        }

        const memberObj: any = member.toObject();
        const token = await authService.createToken(memberObj);

        reply.status(HttpCode.CREATED).send({
          member: profile,
          accessToken: token,
        });
      } catch (err) {
        console.error("Error: SignUp", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    googleAuthRedirect: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const options: any = {
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

    googleCallback: async (request: FastifyRequest, reply: FastifyReply) => {
      const { code } = request.query as { code: string };

      try {
        console.log("Google auth");
        // 1. Get access token
        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            grant_type: "authorization_code",
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenRes.data.access_token;

        // 2. Get user info
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const googleData = userInfo.data;
        const googleId = googleData.id;
        const memberEmail = googleData.email;
        const memberNickname = googleData.name || "Google User";
        const memberImage = googleData.picture || "";

        // 3. Find or create user
        let member = await memberModel.findOne({
          $or: [
            { provider: "google", providerId: googleId }, // Check by Google ID first
            { memberEmail: memberEmail }, // Then check by email
          ],
        });

        if (!member) {
          // Create new user if doesn't exist
          member = await memberModel.create({
            provider: "google",
            providerId: googleId,
            memberEmail: memberEmail,
            memberNickname: memberNickname,
            memberImage: memberImage,
          });
        } else if (member.provider !== "google") {
          // If user exists but with different provider, update with Google info
          member.provider = "google";
          member.providerId = googleId;
          member.memberImage = memberImage;
          await member.save();
        }

        // 4. Create JWT token
        const memberObj: any = member.toObject();
        const token = await authService.createToken(memberObj);

        reply
          .status(HttpCode.CREATED)
          .send({ member: googleData, accessToken: token });
      } catch (err) {
        console.error("Error: SignUp", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    signup: async (
      request: FastifyRequest<{ Body: MemberInput }>,
      reply: FastifyReply
    ) => {
      try {
        const input = request.body;
        const result = await memberService.signup(input);
        const token = await authService.createToken(result);

        reply.setCookie("accessToken", token, {
          maxAge: AUTH_TIMER * 3600 * 1000,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        reply
          .status(HttpCode.CREATED)
          .send({ member: result, accessToken: token });
      } catch (err) {
        console.error("Error: SignUp", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    login: async (
      request: FastifyRequest<{ Body: LoginInput }>,
      reply: FastifyReply
    ) => {
      try {
        console.log("Login");
        const input = request.body;
        const result = await memberService.login(input);
        const token = await authService.createToken(result);

        reply.setCookie("accessToken", token, {
          maxAge: AUTH_TIMER * 3600 * 1000,
          httpOnly: true,
          path: "/",
          // secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        console.log("RESULT", result);

        reply.status(HttpCode.OK).send({ member: result, accessToken: token });
      } catch (err) {
        console.error("Error: Login", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    logout: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log("Logout");
        reply.clearCookie("accessToken", { path: "/" });
        reply.status(HttpCode.OK).send({ logout: true });
      } catch (err) {
        console.error("Error: logout", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    // Add to the returned controller object
    verifyAuth: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        (request as any).member = (request as any).user;
      } catch (err) {
        throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
      }
    },

    deleteAccount: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log("deleteAccount");
        const member = (request as any).member;
        const memberId = shapeIntoMongooseObjectId(member._id);
        await memberModel.findByIdAndRemove(memberId);
        reply.clearCookie("accessToken", { path: "/" });
        reply.status(HttpCode.OK).send({ deleted: true });
      } catch (err) {
        console.error("Error: deleteAccount", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    updateMember: async (
      request: FastifyRequest<{ Body: MemberUpdateInput }>,
      reply: FastifyReply
    ) => {
      try {
        const input = request.body;
        const member = (request as any).member;
        const result = await memberService.updateMember(member, input);
        reply.status(HttpCode.OK).send(result);
      } catch (err) {
        console.error("Error: updateMember", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },
  };
};

export type MemberController = ReturnType<typeof initializeMemberController>;
