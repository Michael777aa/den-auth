// libs/plugins/rateLimiter.ts
import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";

export async function rateLimiter(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100, // requests per IP
    timeWindow: 15 * 60 * 1000, // 15 minutes
    errorResponseBuilder: () => {
      return {
        status: 429,
        error: "Too many requests, please try again later",
      };
    },
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
  });
}
