import { MemberProvider } from "../enums/member.enum";

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  provider?: MemberProvider;
  exp?: Date;
};
