import { AuthUser } from "@/libs/utils/middleware";
import { memberModel } from "./member.schema";

export class MemberService {
  async findOrCreateSocialMember(user: AuthUser) {
    try {
      // Find the member by provider and providerId (unique)
      let member = await memberModel.findOne({
        memberEmail: user.email,
      });

      if (!member) {
        // If no member found, create a new one
        member = new memberModel({
          memberEmail: user.email,
          memberNickname: user.name,
          memberImage: user.picture || "",
          email_verified: user.email_verified,
        });

        await member.save();
      }

      return member;
    } catch (error) {
      console.error("Error in findOrCreateSocialMember:", error);
      throw error;
    }
  }
}
