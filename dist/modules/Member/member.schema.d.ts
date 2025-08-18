import mongoose from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum";
export declare const memberModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    type: "ADMIN" | "USER";
    name: string;
    sub: string;
    provider: MemberProvider;
    exp: number;
    picture?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
