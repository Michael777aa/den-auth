// services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { memberModel } from "./member.schema";

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN = "7d";

  static async signup(email: string, password: string, name: string) {
    const existingUser = await memberModel.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    const user: any = await memberModel.create({
      email,
      password: hashedPassword,
      name,
    });
    return this.generateTokens(user);
  }

  static async login(email: string, password: string) {
    const user = await memberModel.findOne({ email }).select("+password");
    if (!user || !user.password) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return this.generateTokens(user);
  }

  static async requestPasswordReset(email: string) {
    const user = await memberModel.findOne({ email });
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000);
    await user.save();

    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await memberModel.findOne({
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
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      sub: user._id.toString(),
      provider: user.provider,
    };

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
