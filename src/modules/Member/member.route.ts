import { FastifyInstance } from "fastify";
import { initializeAuthController } from "./member.controller";

const memberRoutes = async (server: FastifyInstance) => {
  // Initialize the controller
  const memberController = initializeAuthController(server);

  // Define the POST route for social login
  server.post("/social-login", memberController.loginWithSocialToken);
};

export default memberRoutes;
