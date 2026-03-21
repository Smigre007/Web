import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const db = getSupabaseAdmin();

    // Fetch the internal UUID for this clerk user
    const { data: user } = await db
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (user?.id) {
      // Delete projects (cascades to messages via FK)
      await db.from("projects").delete().eq("user_clerk_id", userId);

      // Delete referrals
      await db.from("referrals").delete().eq("referral_code",
        (await db.from("users").select("referral_code").eq("clerk_id", userId).single()).data?.referral_code ?? ""
      );

      // Delete user record (cascades remaining FK children)
      await db.from("users").delete().eq("clerk_id", userId);
    }

    // Delete from Clerk — this also fires the user.deleted webhook as a secondary cleanup
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);

    logger.info("User account deleted", { userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("User account deletion error", { error: err });
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 });
  }
}
