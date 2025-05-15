import mongoose, { Schema } from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum"; // Import MemberProvider

// Define the member schema
const memberSchema = new Schema(
  {
    email: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sub: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    provider: {
      type: String,
      enum: Object.values(MemberProvider), // MemberProvider is an enum
      required: true,
    },
    exp: {
      type: Number,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

// Create the model based on the schema
export const memberModel = mongoose.model("member", memberSchema);
