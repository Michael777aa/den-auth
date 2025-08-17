import mongoose, { Schema } from "mongoose";

// Define the member schema
const authSchema = new Schema(
  {
    email: { type: String, required: true }, // User email / 사용자 이메일
    name: { type: String, required: true }, // User name / 사용자 이름

    picture: { type: String }, // Profile image / 프로필 이미지
    type: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    password: { type: String, select: false }, // Only for traditional auth
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true } // CreatedAt, UpdatedAt auto / 생성일, 수정일 자동 기록
);

authSchema.index({ email: 1 }, { unique: true });

export const authModel = mongoose.model("traditional_members", authSchema);
