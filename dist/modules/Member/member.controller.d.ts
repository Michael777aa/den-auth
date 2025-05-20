import { AuthUser } from "@/libs/utils/middleware";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
export declare function initializeAuthController(server: FastifyInstance): {
    loginWithSocialToken: (request: FastifyRequest<{
        Body: AuthUser;
    }>, reply: FastifyReply) => Promise<undefined>;
};
