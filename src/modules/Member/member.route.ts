import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { initializeMemberController } from "./member.controller";

const memberRoutes = async (server: FastifyInstance) => {
  const memberController = initializeMemberController(server);

  // Custom Email/Password
  server.post(
    "/signup",
    {
      schema: {
        tags: ["Authentication"],
        description: "Register a new member with email/password",
        body: {
          type: "object",
          required: ["memberEmail", "memberPassword"],
          properties: {
            memberEmail: { type: "string", format: "email" },
            memberPassword: { type: "string", minLength: 8 },
            memberNickname: { type: "string" },
          },
        },
        response: {
          201: {
            description: "Successful registration",
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
        },
      },
    },
    memberController.signup
  );

  server.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        description: "Login with email/password",
        body: {
          type: "object",
          required: ["memberEmail", "memberPassword"],
          properties: {
            memberEmail: { type: "string", format: "email" },
            memberPassword: { type: "string" },
          },
        },
      },
    },
    memberController.login
  );

  // OAuth endpoints
  server.get(
    "/kakao",
    {
      schema: {
        tags: ["Authentication"],
        description: "Initiate Kakao OAuth flow",
        externalDocs: {
          url: "https://developers.kakao.com",
          description: "Kakao developer documentation",
        },
      },
    },
    memberController.kakaoAuthRedirect
  );

  // ... add similar schemas for other routes

  // Protected routes
  server.post(
    "/logout",
    {
      preHandler: [memberController.verifyAuth],
      schema: {
        tags: ["Member"],
        description: "Logout current session",
        security: [{ bearerAuth: [] }],
      },
    },
    memberController.logout
  );

  server.post(
    "/update",
    {
      preHandler: [memberController.verifyAuth],
      schema: {
        tags: ["Member"],
        description: "Update member profile",
        consumes: ["multipart/form-data"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            memberNickname: { type: "string" },
            memberImage: { type: "string", format: "binary" },
          },
        },
      },
    },
    memberController.updateMember as RouteHandlerMethod
  );
};

export default memberRoutes;
