import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/** Estado da integração GitHub (sem expor tokens). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("users")
    .select("github_username, github_access_token")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false, username: null });
  }

  const connected = Boolean(data.github_access_token && data.github_username);

  return NextResponse.json({
    connected,
    username: connected ? data.github_username : null,
  });
}
