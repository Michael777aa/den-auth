"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const member_controller_1 = require("./member.controller");
const memberRoutes = async (server) => {
    // Initialize the controller
    const memberController = (0, member_controller_1.initializeMemberController)(server);
    // ✅ Custom Email/Password
    server.post("/signup", memberController.signup);
    server.post("/login", memberController.login);
    // ✅ Kakao OAuth
    server.get("/kakao", memberController.kakaoAuthRedirect);
    server.get("/kakao/callback", memberController.kakaoCallback);
    // ✅ Naver OAuth
    server.get("/naver", memberController.naverAuthRedirect);
    server.get("/naver/callback", memberController.naverCallback);
    // ✅ Google OAuth
    server.get("/google", memberController.googleAuthRedirect);
    server.get("/google/callback", memberController.googleCallback);
    // ✅ Logout (requires auth middleware)
    server.post("/logout", { preHandler: [memberController.verifyAuth] }, memberController.logout);
    // ✅ Delete account (requires auth middleware)
    server.post("/delete", { preHandler: [memberController.verifyAuth] }, memberController.deleteAccount);
    // ✅ Update member (auth + file upload)
    server.post("/update", {
        preHandler: [memberController.verifyAuth],
    }, memberController.updateMember);
};
exports.default = memberRoutes;
//# sourceMappingURL=member.route.js.map