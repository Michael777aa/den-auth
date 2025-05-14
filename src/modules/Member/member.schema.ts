import mongoose, { Schema } from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum";

const memberSchema = new Schema(
  {
    memberEmail: { type: String, index: { unique: true, sparse: true } },
    memberNickname: { type: String },
    memberImage: { type: String },
    memberVerified: { type: String },
    // memberPassword: {
    //   type: String,
    //   select: false,
    //   required: function (this: any): boolean {
    //     return this.provider === "custom";
    //   },
    // },
  },
  { timestamps: true }
);

export const memberModel = mongoose.model("member", memberSchema);
