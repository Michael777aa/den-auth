import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import path from "path";
import memberRoutes from "./modules/Member/member.route";

const app = fastify({
  ignoreTrailingSlash: true,
});

// Register plugins
async function registerPlugins() {
  await app.register(fastifyCookie);
  await app.register(fastifyJwt, {
    secret:
      process.env.SECRET_TOKEN ||
      "2b1f5f9a7e78c47c925dd9ef8f81ad3d74c0e0a59f2378ea6f499d858d2fc6b4",
    cookie: {
      cookieName: "accessToken",
      signed: false,
    },
  });
  await app.register(multipart, {
    attachFieldsToBody: "keyValues",
    limits: { fileSize: 2000000 },
  });
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "../uploads"),
    prefix: "/public/",
  });
}

// Register routes
function registerRoutes() {
  app.register(memberRoutes, { prefix: "/api/v1/auth" });
}

async function initApp() {
  await registerPlugins();
  registerRoutes();
  return app;
}

export default initApp;
