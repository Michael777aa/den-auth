// Member database schema and model for storing user info from social login (Google, Kakao, Naver)
// 구글, 카카오, 네이버 소셜 로그인 사용자의 정보를 저장하는 멤버 데이터베이스 스키마 및 모델

import mongoose, { Schema } from "mongoose";
import { MemberProvider } from "../../libs/enums/member.enum"; // Import MemberProvider

// Define the member schema
const memberSchema = new Schema(
  {
    email: { type: String, required: true }, // User email / 사용자 이메일
    name: { type: String, required: true }, // User name / 사용자 이름
    sub: { type: String }, // Provider user ID / 소셜 제공자 사용자 ID
    picture: { type: String }, // Profile image / 프로필 이미지
    provider: {
      type: String,
      enum: Object.values(MemberProvider), // Social provider (Google, Kakao, Naver) / 소셜 제공자
    },
    exp: {
      type: Number,
      default: Date.now(), // Token expiry or created time / 토큰 만료 혹은 생성 시간
    },
    password: { type: String, select: false }, // Only for traditional auth
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true } // CreatedAt, UpdatedAt auto / 생성일, 수정일 자동 기록
);

// Unique index for provider and sub
// provider와 sub의 조합이 유일하도록 인덱스 설정
memberSchema.index({ provider: 1, sub: 1 }, { unique: true });

// Create the model based on the schema
// 스키마를 기반으로 모델 생성
export const memberModel = mongoose.model("member", memberSchema);
