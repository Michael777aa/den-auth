import { AuthUser } from "@/libs/utils/middleware";
export declare class MemberService {
    /**
     * Find a user by provider and sub, or create one if not exists.
     * 소셜 제공자와 sub로 사용자를 찾고, 없으면 새로 생성합니다.
     */
    findOrCreateSocialMember(user: AuthUser): Promise<import("mongoose").Document<unknown, any, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        email: string;
        name: string;
        sub: string;
        provider: import("../../libs/enums/member.enum").MemberProvider;
        exp: number;
        picture?: string | undefined;
    }> & Omit<{
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        email: string;
        name: string;
        sub: string;
        provider: import("../../libs/enums/member.enum").MemberProvider;
        exp: number;
        picture?: string | undefined;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
}
