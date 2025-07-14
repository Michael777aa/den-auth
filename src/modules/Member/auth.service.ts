import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authModel } from "./traditionalauth.schema";

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN = "7d";

  static async signup(email: string, password: string, name: string) {
    const existingUser = await authModel.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    const user: any = await authModel.create({
      email,
      password: hashedPassword,
      name,
    });

    return this.generateTokens(user);
  }

  static async login(email: string, password: string) {
    const user = await authModel.findOne({ email }).select("+password");
    if (!user || !user.password) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return this.generateTokens(user);
  }

  static async requestPasswordReset(email: string) {
    const user = await authModel.findOne({ email });
    if (!user) throw new Error("User not found");

    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    user.resetPasswordToken = code;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes
    await user.save();

    await this.sendResetCode(user.email, code);

    return { message: "Reset code sent to email." };
  }

  private static async sendResetCode(to: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Deen Daily" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Deen Daily Password Reset Code",
      html: `
        <p>Your password reset code is:</p>
        <h2>${code}</h2>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await authModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid or expired token");

    user.password = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return this.generateTokens(user);
  }

  private static generateTokens(user: any) {
    const payload = { id: user._id, email: user.email, name: user.name };
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      this.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { accessToken, refreshToken };
  }
}
