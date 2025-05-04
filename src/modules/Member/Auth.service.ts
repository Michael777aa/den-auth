import { FastifyInstance } from "fastify";
import { Member } from "../../libs/types/member";
import { AUTH_TIMER } from "../../libs/config";
import Errors, { HttpCode, Message } from "../../libs/Error";

class AuthService {
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  public async createToken(payload: Member): Promise<string> {
    try {
      const duration = `${AUTH_TIMER}h`;
      return this.fastify.jwt.sign(payload, { expiresIn: duration });
    } catch (err) {
      console.error("Token creation error:", err);
      throw new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED);
    }
  }

  public async checkAuth(token: string): Promise<Member> {
    try {
      return await this.fastify.jwt.verify<Member>(token);
    } catch (err) {
      console.error("Token verification error:", err);
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    }
  }

  public static decorateFastifyInstance(fastify: FastifyInstance) {
    fastify.decorateRequest("member", null);

    fastify.decorate("authenticate", async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
        request.member = request.user;
      } catch (err) {
        throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
      }
    });
  }
}

export default AuthService;
