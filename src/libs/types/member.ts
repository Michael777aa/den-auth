import { ObjectId } from "mongoose";
import { Session } from "express-session";
import { Request } from "express";
import { MemberProvider } from "../enums/member.enum";

export interface MemberInput {
  _id: ObjectId;
  memberImage?: string;
  memberEmail?: string;
  memberNickname?: string;
  memberPassword?: any;
  provider: MemberProvider;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  _id: ObjectId;
  memberEmail?: string;
  memberNickname?: string;
  memberPassword?: string;
  memberImage?: string;
  provider: MemberProvider;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberUpdateInput {
  _id: ObjectId;
  memberImage?: string;
  memberEmail?: string;
  memberNickname?: string;
  memberPassword?: any;
  provider: MemberProvider;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  memberEmail: string;
  memberPassword: string;
}

export interface ExtendedRequest extends Request {
  member: Member;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member: Member };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
