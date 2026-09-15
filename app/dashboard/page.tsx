import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardRedirectPage() {
  const session = await getSession();

  if (!session) {
    // Prefer login over logout on missing cookie — avoids error flashes on refresh.
    redirect("/login");
  }

  redirect(getDashboardPath(session.role));
}
