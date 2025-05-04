import { FastifyInstance } from "fastify";
import { Member } from "../../libs/types/member";
declare class AuthService {
    private readonly fastify;
    constructor(fastify: FastifyInstance);
    createToken(payload: Member): Promise<string>;
    checkAuth(token: string): Promise<Member>;
    static decorateFastifyInstance(fastify: FastifyInstance): void;
}
export default AuthService;
