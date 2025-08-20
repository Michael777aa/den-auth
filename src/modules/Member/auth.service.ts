import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { StreamChat } from "stream-chat";
import { authModel } from "./traditionalAuth.schema";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "dsafasdasdfsdafdsawe";
  private static readonly JWT_EXPIRES_IN = "7d";
  private static readonly REFRESH_EXPIRES_IN = "30d";

  /**
   * Register a new user with email and password
   * 이메일과 비밀번호로 새 사용자를 등록합니다.
   */

  async signup(email: string, password: string, name: string) {
    try {
      const existingUser = await authModel.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(
        password,
        AuthService.SALT_ROUNDS
      );

      const user = await authModel.create({
        email,
        password: hashedPassword,
        name,
      });

      return this.generateTokens(user);
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   * 이메일과 비밀번호로 사용자 로그인
   */
  async login(email: string, password: string) {
    try {
      const user = await authModel.findOne({ email }).select("+password");
      if (!user || !user.password) throw new Error("Invalid credentials");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      if (!streamApiKey || !streamApiSecret) {
        throw new Error(
          "STREAM_API_KEY and STREAM_API_SECRET must be defined in environment variables"
        );
      }
      const client = StreamChat.getInstance(streamApiKey, streamApiSecret);

      const token = client.createToken(user._id.toString());
      return { ...this.generateTokens(user), streamToken: token };
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  /**
   * Request password reset by sending a code to email
   * 이메일로 비밀번호 재설정 코드 전송
   */
  async requestPasswordReset(email: string) {
    try {
      const user = await authModel.findOne({ email });
      if (!user) throw new Error("User not found");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("Invalid email format");

      const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
      user.resetPasswordToken = code;
      user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      await this.sendResetCode(user.email, code);
      return { message: "Reset code sent to email." };
    } catch (error) {
      console.error("Error in requestPasswordReset:", error);
      throw error;
    }
  }

  /**
   * Reset password using the code (token)
   * 코드(토큰)으로 비밀번호 재설정
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await authModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) throw new Error("Invalid or expired token");

      user.password = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return this.generateTokens(user);
    } catch (error) {
      console.error("Error in resetPassword:", error);
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   * 액세스 및 리프레시 토큰 생성
   */
  private generateTokens(user: any) {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      type: user.type || "user",
    };

    const accessToken = jwt.sign(payload, AuthService.JWT_SECRET, {
      expiresIn: AuthService.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      AuthService.JWT_SECRET,
      { expiresIn: AuthService.REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Send reset code via email
   * 이메일로 재설정 코드 전송
   */
  private async sendResetCode(to: string, code: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Deen Daily" <${EMAIL_USER}>`,
        to,
        subject: "Your Deen Daily Password Reset Code",
        html: `
          <p>Your password reset code is:</p>
          <h2>${code}</h2>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error("Error in sendResetCode:", error);
      throw error;
    }
  }
}
