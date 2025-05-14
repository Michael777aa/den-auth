import { MemberProvider } from "../enums/member.enum";

export type AuthUser = {
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
};
