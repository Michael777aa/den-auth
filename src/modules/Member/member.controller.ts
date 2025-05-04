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
          provider: "kakao",
          providerId: kakaoId,
        });

        if (!member) {
          member = await memberModel.create({
            provider: "kakao",
            providerId: kakaoId,
            memberEmail: memberEmail,
            memberNickname: memberNickname,
            memberImage: memberImage,
          });
        }

        const memberObj: any = member.toObject();
        const token = await authService.createToken(memberObj);

        reply
          .status(HttpCode.CREATED)
          .send({ member: kakaoData, accessToken: token });
      } catch (error) {
        console.error("Kakao callback error:", error);
        reply.status(500).send({ error: "Kakao authentication failed" });
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
          provider: "naver",
          providerId: naverId,
        });

        if (!member) {
          member = await memberModel.create({
            provider: "naver",
            providerId: naverId,
            memberEmail: memberEmail || "email@naver.com",
            memberNickname: memberName,
            memberImage: memberImage,
          });
        }

        const memberObj: any = member.toObject();
        const token = await authService.createToken(memberObj);

        reply.status(HttpCode.CREATED).send({
          member: profile,
          accessToken: token,
        });
      } catch (error) {
        console.error("Naver callback error:", error);
        reply.status(500).send({ error: "Naver authentication failed" });
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
        const input = request.body;
        const result = await memberService.login(input);
        const token = await authService.createToken(result);

        reply.setCookie("accessToken", token, {
          maxAge: AUTH_TIMER * 3600 * 1000,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        reply.status(HttpCode.OK).send({ member: result, accessToken: token });
      } catch (err) {
        console.error("Error: Login", err);
        if (err instanceof Errors) reply.status(err.code).send(err);
        else reply.status(Errors.standard.code).send(Errors.standard);
      }
    },

    logout: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
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
