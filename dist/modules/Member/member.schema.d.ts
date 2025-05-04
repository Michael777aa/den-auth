import mongoose from "mongoose";
export declare const memberModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    provider: string;
    providerId?: string | undefined;
    memberEmail?: string | undefined;
    memberNickname?: string | undefined;
    memberImage?: string | undefined;
    memberPassword?: string | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    provider: string;
    providerId?: string | undefined;
    memberEmail?: string | undefined;
    memberNickname?: string | undefined;
    memberImage?: string | undefined;
    memberPassword?: string | undefined;
}>>;
