import { AuthUser } from "@/libs/utils/middleware";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { MemberService } from "./member.service";

export function initializeAuthController(server: FastifyInstance) {
  const memberService = new MemberService();

  return {
    loginWithSocialToken: async (
      request: FastifyRequest<{ Body: AuthUser }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, name, picture, sub, provider, exp } = request.body;

        if (!email || !provider || !name) {
          return reply.status(400).send({ error: "Missing required fields" });
        }
        const result = await memberService.findOrCreateSocialMember({
          email,
          name,
          picture,
          sub,
          provider,
          exp,
        });
      } catch (err) {
        console.error("Social login error", err);
        return reply.status(500).send({ error: "Server error saving user" });
      }
    },
  };
}
