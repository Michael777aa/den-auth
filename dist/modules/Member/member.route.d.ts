import { FastifyInstance } from "fastify";
declare const authRoutes: (server: FastifyInstance) => Promise<void>;
export default authRoutes;
