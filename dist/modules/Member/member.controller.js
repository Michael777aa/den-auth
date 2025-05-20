"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAuthController = initializeAuthController;
const member_service_1 = require("./member.service");
function initializeAuthController(server) {
    const memberService = new member_service_1.MemberService();
    return {
        loginWithSocialToken: async (request, reply) => {
            try {
                const { email, name, picture, sub, provider, exp } = request.body;
                if (!email || !provider || !name) {
                    return reply.status(400).send({ error: "Missing required fields" });
                }
                const result = await memberService.findOrCreateSocialMember({
                    email,
                    name,
                    picture,
                    sub,
                    provider,
                    exp,
                });
            }
            catch (err) {
                console.error("Social login error", err);
                return reply.status(500).send({ error: "Server error saving user" });
            }
        },
    };
}
//# sourceMappingURL=member.controller.js.map