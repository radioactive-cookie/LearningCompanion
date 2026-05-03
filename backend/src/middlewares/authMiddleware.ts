import { type Request, type Response, type NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { db, usersTable } from "@workspace/db";
import type { AuthUser } from "@workspace/api-zod";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;

      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseIssuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : "";
const supabaseAud = process.env.SUPABASE_JWT_AUD ?? "authenticated";
const jwks = supabaseUrl ? createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/keys`)) : null;

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

function splitName(fullName: string | null): { firstName: string | null; lastName: string | null } {
  if (!fullName) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function upsertUserFromToken(payload: Record<string, unknown>) {
  const id = typeof payload.sub === "string" ? payload.sub : null;
  if (!id) return null;

  const email = typeof payload.email === "string" ? payload.email : null;
  const meta = (payload.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof meta.full_name === "string"
    ? meta.full_name
    : typeof meta.name === "string"
      ? meta.name
      : null;
  const givenName = typeof meta.given_name === "string" ? meta.given_name : null;
  const familyName = typeof meta.family_name === "string" ? meta.family_name : null;
  const split = splitName(fullName);
  const firstName = split.firstName ?? givenName;
  const lastName = split.lastName ?? familyName;
  const profileImageUrl = typeof meta.avatar_url === "string"
    ? meta.avatar_url
    : typeof meta.picture === "string"
      ? meta.picture
      : null;

  const [user] = await db
    .insert(usersTable)
    .values({
      id,
      email,
      firstName,
      lastName,
      profileImageUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email,
        firstName,
        lastName,
        profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user ?? null;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  const token = getBearerToken(req);
  if (!token || !jwks || !supabaseIssuer) {
    next();
    return;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: supabaseIssuer,
      audience: supabaseAud,
    });

    const dbUser = await upsertUserFromToken(payload as Record<string, unknown>);
    if (dbUser) {
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
      } satisfies AuthUser;
    }
  } catch {
    // Invalid or expired token; treat as unauthenticated
  }

  next();
}
