import * as zod from "zod";

export const AuthUser = zod.object({
  id: zod.string(),
  email: zod.string().nullable(),
  firstName: zod.string().nullable(),
  lastName: zod.string().nullable(),
  profileImageUrl: zod.string().nullable(),
});
export type AuthUser = zod.infer<typeof AuthUser>;

export const GetCurrentAuthUserResponse = zod.object({
  user: AuthUser.nullable(),
});

export const ExchangeMobileAuthorizationCodeBody = zod.object({
  code: zod.string(),
  code_verifier: zod.string(),
  redirect_uri: zod.string(),
  state: zod.string(),
  nonce: zod.string().optional(),
});

export const ExchangeMobileAuthorizationCodeResponse = zod.object({
  token: zod.string(),
});

export const LogoutMobileSessionResponse = zod.object({
  success: zod.boolean(),
});
