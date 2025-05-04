import { FastifyRequest } from "fastify";
import { Member } from "../libs/types/member";

declare module "fastify" {
  interface FastifyRequest {
    member?: Member;
    file?: {
      path: string;
      // Add other file properties if needed
    };
  }
}

export type ExtendedFastifyRequest = FastifyRequest & {
  member?: Member;
  file?: {
    path: string;
  };
};
