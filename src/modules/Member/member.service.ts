import { AuthUser } from "@/libs/utils/middleware";
import { memberModel } from "./member.schema";

export class MemberService {
  async findOrCreateSocialMember(user: AuthUser) {
    try {
      // Find the member by provider and providerId (unique)
      let member = await memberModel.findOne({
        provider: user.provider,
        sub: user.sub,
      });

      if (!member) {
        // If no member found, create a new one
        member = new memberModel({
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
    } catch (error) {
      console.error("Error in findOrCreateSocialMember:", error);
      throw error;
    }
  }
}
