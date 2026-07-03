import { cache } from "react";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { Role, Stage } from "@/generated/prisma/client";
import { prisma } from "./prisma";

const SESSION_COOKIE = "tmkeen_session";
const ROLE_COOKIE = "tmkeen_role";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() ?? "";
}

const sessionSecret = getSessionSecret();
if (!sessionSecret || sessionSecret === "change-me-in-production") {
  console.warn(
    "[session] SESSION_SECRET is unset or default — set a strong secret in production"
  );
}

function sessionCookieSecure(): boolean {
  if (process.env.SESSION_COOKIE_SECURE === "true") return true;
  if (process.env.SESSION_COOKIE_SECURE === "false") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl.startsWith("https://");
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  stage: Stage;
  guideId: string | null;
};

function signSessionToken(userId: string, timestamp: number): string {
  const secret = getSessionSecret();
  const userPart = Buffer.from(userId, "utf8").toString("base64url");
  const tsPart = Buffer.from(String(timestamp), "utf8").toString("base64url");
  const payload = `${userPart}.${tsPart}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

function verifySessionToken(token: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userPart, tsPart, sigPart] = parts;
  const payload = `${userPart}.${tsPart}`;

  let expectedSig: Buffer;
  let actualSig: Buffer;
  try {
    expectedSig = createHmac("sha256", secret).update(payload).digest();
    actualSig = Buffer.from(sigPart, "base64url");
  } catch {
    return null;
  }

  if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) {
    return null;
  }

  try {
    return Buffer.from(userPart, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role?: Role): Promise<void> {
  const cookieStore = await cookies();
  const opts = sessionCookieOptions();
  const token = signSessionToken(userId, Date.now());
  cookieStore.set(SESSION_COOKIE, token, opts);
  if (role) {
    cookieStore.set(ROLE_COOKIE, role, opts);
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

/** O(1) per request — cached for the lifetime of one RSC render */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const userId = verifySessionToken(raw);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      stage: true,
      guideId: true,
    },
  });

  return user;
});

export async function requireSession(
  allowedRoles?: Role[]
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
