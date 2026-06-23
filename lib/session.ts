import { cookies } from "next/headers";
import { Role, Stage } from "@/generated/prisma/client";
import { prisma } from "./prisma";

const SESSION_COOKIE = "tmkeen_session";
const ROLE_COOKIE = "tmkeen_role";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  stage: Stage;
  guideId: string | null;
};

export async function createSession(userId: string, role?: Role): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  if (role) {
    cookieStore.set(ROLE_COOKIE, role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
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
}

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
