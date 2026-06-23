import { redirect } from "next/navigation";
import { destroySession } from "@/lib/session";

export async function GET() {
  await destroySession();
  redirect("/login");
}

export async function POST() {
  await destroySession();
  redirect("/login");
}
