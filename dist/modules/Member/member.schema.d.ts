import mongoose from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum";
export declare const memberModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | undefined;
}>>;
