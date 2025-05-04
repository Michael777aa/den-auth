import { FastifyRequest, FastifyReply } from "fastify";
import { LoginInput, MemberInput, MemberUpdateInput } from "../../libs/types/member";
import { FastifyInstance } from "fastify";
export declare const initializeMemberController: (fastify: FastifyInstance) => {
    kakaoAuthRedirect: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    kakaoCallback: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    naverAuthRedirect: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    naverCallback: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    googleAuthRedirect: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    googleCallback: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    signup: (request: FastifyRequest<{
        Body: MemberInput;
    }>, reply: FastifyReply) => Promise<void>;
    login: (request: FastifyRequest<{
        Body: LoginInput;
    }>, reply: FastifyReply) => Promise<void>;
    logout: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    deleteAccount: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    updateMember: (request: FastifyRequest<{
        Body: MemberUpdateInput;
    }>, reply: FastifyReply) => Promise<void>;
};
export type MemberController = ReturnType<typeof initializeMemberController>;
