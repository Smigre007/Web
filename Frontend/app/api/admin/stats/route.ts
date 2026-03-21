import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

function isAdmin(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  const adminIds = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return adminIds.includes(userId);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const db = getSupabaseAdmin();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Use SQL aggregations instead of loading all rows into JS
    const [
      totalUsersRes,
      usersThisMonthRes,
      usersByPlanRes,
      totalProjectsRes,
      projectsThisMonthRes,
      completedProjectsRes,
      projectsByTypeRes,
      contactsRes,
    ] = await Promise.all([
      db.from("users").select("*", { count: "exact", head: true }),
      db.from("users").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
      db.from("users").select("plan"),
      db.from("projects").select("*", { count: "exact", head: true }),
      db.from("projects").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
      db.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
      db.from("projects").select("type"),
      db.from("contact_requests")
        .select("id, name, email, plan, message, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // Aggregate plan breakdown from the small plan column fetch
    const planCounts: Record<string, number> = {};
    for (const u of usersByPlanRes.data ?? []) {
      planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1;
    }

    // Aggregate type breakdown from the small type column fetch
    const typeCounts: Record<string, number> = {};
    for (const p of projectsByTypeRes.data ?? []) {
      typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1;
    }

    return NextResponse.json({
      users: {
        total: totalUsersRes.count ?? 0,
        thisMonth: usersThisMonthRes.count ?? 0,
        byPlan: planCounts,
      },
      projects: {
        total: totalProjectsRes.count ?? 0,
        thisMonth: projectsThisMonthRes.count ?? 0,
        completed: completedProjectsRes.count ?? 0,
        byType: typeCounts,
      },
      recentContacts: contactsRes.data ?? [],
    });
  } catch (err) {
    logger.error("Admin stats error", { error: err });
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}
