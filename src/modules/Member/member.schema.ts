// models/Member.model.ts
import mongoose, { Schema } from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum";

const memberSchema = new Schema(
  {
    provider: {
      type: String,
      enum: MemberProvider,
      required: true,
      default: MemberProvider.custom,
    },
    providerId: { type: String },
    memberEmail: { type: String, index: { unique: true, sparse: true } },
    memberNickname: { type: String },
    memberImage: { type: String },
    memberPassword: {
      type: String,
      select: false,
      required: function (this: any): boolean {
        return this.provider === "custom";
      },
    },
  },
  { timestamps: true }
);

export const memberModel = mongoose.model("member", memberSchema);
