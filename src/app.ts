import fastify from "fastify";
import cors from "@fastify/cors";
import memberRoutes from "./modules/member/member.route";

const app = fastify({
  ignoreTrailingSlash: true,
});

// Register plugins
async function registerPlugins() {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
}

function registerRoutes() {
  app.register(memberRoutes, { prefix: "/api/v1/auth" });
}

async function initApp() {
  await registerPlugins();
  registerRoutes();
  return app;
}

export default initApp;
