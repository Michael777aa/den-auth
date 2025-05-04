import { memberModel } from "./member.schema";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../../libs/types/member";
import Errors, { HttpCode, Message } from "../../libs/Error";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../../libs/config";
import { Document } from "mongoose";

class MemberService {
  private readonly memberModel;

  constructor() {
    this.memberModel = memberModel;
  }

  public async signup(input: MemberInput): Promise<any> {
    try {
      if (
        !input.memberEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.memberEmail)
      ) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.WRONG_EMAIL);
      }

      if (!input.memberPassword || input.memberPassword.length < 6) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.WRONG_PASSWORD);
      }

      const salt = await bcrypt.genSalt();
      input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

      const result = await this.memberModel.create(input);

      if (!result)
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

      return result.toObject();
    } catch (err) {
      console.error("Error, model: signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    try {
      if (!input.memberEmail || !input.memberPassword) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
      }

      const member: any = await this.memberModel
        .findOne({ memberEmail: input.memberEmail })
        .select("+memberPassword")
        .lean()
        .exec();

      if (!member) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_EMAIL);
      }

      const isMatch: any = await bcrypt.compare(
        input.memberPassword,
        member.memberPassword
      );

      if (!isMatch) {
        throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
      }

      return member;
    } catch (err) {
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    try {
      if (!input || Object.keys(input).length === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
      }

      const memberId = shapeIntoMongooseObjectId(member._id);
      const result: any = await this.memberModel
        .findOneAndUpdate(
          { _id: memberId },
          { $set: input },
          { new: true, runValidators: true }
        )
        .lean()
        .exec();

      if (!result)
        throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
      return result;
    } catch (err) {
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async findOrCreateOAuthUser(input: MemberInput): Promise<Member> {
    try {
      if (!input.provider || !input.providerId) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
      }

      let member: any = await this.memberModel
        .findOne({
          provider: input.provider,
          providerId: input.providerId,
        })
        .lean()
        .exec();

      if (!member) {
        const newMember = await this.memberModel.create(input);
        return newMember.toObject();
      }

      return member;
    } catch (err) {
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default MemberService;
