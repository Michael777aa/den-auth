"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const member_controller_1 = require("./member.controller");
const memberRoutes = async (server) => {
    // Initialize the controller
    const memberController = (0, member_controller_1.initializeAuthController)(server);
    // Define the POST route for social login
    server.post("/social-login", memberController.loginWithSocialToken);
};
exports.default = memberRoutes;
//# sourceMappingURL=member.route.js.map