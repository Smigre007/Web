import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  await db
    .from("users")
    .update({ github_access_token: null, github_username: null })
    .eq("clerk_id", userId);

  return NextResponse.json({ ok: true });
}
