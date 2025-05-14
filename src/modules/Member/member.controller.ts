import { AuthUser } from "@/libs/utils/middleware";
import { MemberService } from "./member.service";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function initializeAuthController(server: FastifyInstance) {
  const memberService = new MemberService();

  return {
    loginWithSocialToken: async (
      request: FastifyRequest<{ Body: AuthUser }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, name, picture, email_verified } = request.body;

        if (!email) {
          return reply.status(400).send({ error: "Missing required fields" });
        }

        const result = await memberService.findOrCreateSocialMember({
          email,
          name,
          picture,
          email_verified,
        });
        console.log("RESULT", result);
      } catch (err) {
        console.error("Social login error", err);
        return reply.status(500).send({ error: "Server error saving user" });
      }
    },
  };
}
