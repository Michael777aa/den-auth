"use strict";
// Member database schema and model for storing user info from social login (Google, Kakao, Naver)
// 구글, 카카오, 네이버 소셜 로그인 사용자의 정보를 저장하는 멤버 데이터베이스 스키마 및 모델
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const member_enum_1 = require("../../libs/enums/member.enum"); // Import MemberProvider
// Define the member schema
const memberSchema = new mongoose_1.Schema({
    email: { type: String, required: true }, // User email / 사용자 이메일
    name: { type: String, required: true }, // User name / 사용자 이름
    sub: { type: String, required: true }, // Provider user ID / 소셜 제공자 사용자 ID
    type: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
    picture: { type: String }, // Profile image / 프로필 이미지
    provider: {
        type: String,
        enum: Object.values(member_enum_1.MemberProvider), // Social provider (Google, Kakao, Naver) / 소셜 제공자
        required: true,
    },
    exp: {
        type: Number,
        default: Date.now(), // Token expiry or created time / 토큰 만료 혹은 생성 시간
    },
}, { timestamps: true } // CreatedAt, UpdatedAt auto / 생성일, 수정일 자동 기록
);
// Unique index for provider and sub
// provider와 sub의 조합이 유일하도록 인덱스 설정
memberSchema.index({ provider: 1, sub: 1 }, { unique: true });
// Create the model based on the schema
// 스키마를 기반으로 모델 생성
exports.memberModel = mongoose_1.default.model("member", memberSchema);
//# sourceMappingURL=member.schema.js.map