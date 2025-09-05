// Service for finding or creating a social login member in the database.
// 소셜 로그인 사용자를 데이터베이스에서 찾거나 새로 생성하는 서비스입니다.
import { memberModel } from "./member.schema";

export class MemberService {
  /**
   * Find a user by provider and sub, or create one if not exists.
   * 소셜 제공자와 sub로 사용자를 찾고, 없으면 새로 생성합니다.
   */

  async findOrCreateSocialMember(user: any) {
    try {
      // Find member by provider and sub / provider와 sub로 멤버 찾기
      let member: any = await memberModel.findOne({
        provider: user.provider,
        sub: user.sub,
      });

      if (!member) {
        // If not found, create new / 없으면 새로 생성
        member = new memberModel({
          email: user.email,
          name: user.name,
          sub: user.sub,
          picture: user.picture || "",
          provider: user.provider,
          exp: user.exp,
          type: user.type,
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
