import { AuthUser } from "@/libs/utils/middleware";
export declare class MemberService {
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
