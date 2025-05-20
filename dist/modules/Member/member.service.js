"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
const member_schema_1 = require("./member.schema");
class MemberService {
    async findOrCreateSocialMember(user) {
        try {
            // Find the member by provider and providerId (unique)
            let member = await member_schema_1.memberModel.findOne({
                provider: user.provider,
                sub: user.sub,
            });
            if (!member) {
                // If no member found, create a new one
                member = new member_schema_1.memberModel({
                    email: user.email,
                    name: user.name,
                    sub: user.sub,
                    picture: user.picture || "",
                    provider: user.provider,
                    exp: user.exp,
                });
                await member.save();
            }
            return member;
        }
        catch (error) {
            console.error("Error in findOrCreateSocialMember:", error);
            throw error;
        }
    }
}
exports.MemberService = MemberService;
//# sourceMappingURL=member.service.js.map