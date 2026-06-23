import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardPath } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/logout");
  }

  redirect(getDashboardPath(session.role));
}
