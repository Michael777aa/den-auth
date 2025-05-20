export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  provider?: string;
  exp?: number;
};
