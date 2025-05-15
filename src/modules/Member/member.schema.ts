import mongoose, { Schema } from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum"; // Import MemberProvider

// Define the member schema
const memberSchema = new Schema(
  {
    email: {
      type: String,
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
      enum: Object.values(MemberProvider),
      required: true,
    },
    exp: {
      type: Number,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

// Unique index on provider + sub (NOT email)
memberSchema.index({ provider: 1, sub: 1 }, { unique: true });

// Create the model based on the schema
export const memberModel = mongoose.model("member", memberSchema);
