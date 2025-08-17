// Service for finding or creating a social login member in the database.
// 소셜 로그인 사용자를 데이터베이스에서 찾거나 새로 생성하는 서비스입니다.
import { streamApiKey, streamApiSecret } from "../../libs/utils/constants";
import { memberModel } from "./member.schema";
import { StreamChat } from "stream-chat";

export class MemberService {
  /**
   * Find a user by provider and sub, or create one if not exists.
   * 소셜 제공자와 sub로 사용자를 찾고, 없으면 새로 생성합니다.
   */

  async findOrCreateSocialMember(user: any) {
    try {
      if (!streamApiKey || !streamApiSecret) {
        throw new Error(
          "STREAM_API_KEY and STREAM_API_SECRET must be defined in environment variables"
        );
      }
      const client = StreamChat.getInstance(streamApiKey, streamApiSecret);

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
        });
        await member.save();
      }
      const streamUserId = member._id.toString();

      await client.upsertUser({
        id: streamUserId,
        name: member.name || member.email,
        image: member.picture || undefined,
      });

      const token = client.createToken(streamUserId);
      member.stream = token;
      console.log("TOKEN", token);
      console.log("MEMBER", member);

      return {
        ...member.toObject(),
        streamToken: token,
      };
    } catch (error) {
      console.error("Error in findOrCreateSocialMember:", error);
      throw error;
    }
  }
}
