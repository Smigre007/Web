import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const db = getSupabaseAdmin();

    const [userRes, projectsRes] = await Promise.all([
      db
        .from("users")
        .select("email, first_name, last_name, plan, generations_used, generations_limit, preferences, created_at")
        .eq("clerk_id", userId)
        .single(),
      db
        .from("projects")
        .select("id, name, description, type, status, tech_stack, created_at, updated_at")
        .eq("user_clerk_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const user = userRes.data;
    const projects = projectsRes.data ?? [];

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        email: user?.email ?? "",
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
        plan: user?.plan ?? "free",
        created_at: user?.created_at ?? "",
      },
      usageStats: {
        generations_used: user?.generations_used ?? 0,
        generations_limit: user?.generations_limit ?? 3,
      },
      preferences: user?.preferences ?? {},
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        status: p.status,
        tech_stack: p.tech_stack,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="meus-dados-neurocode.json"`,
      },
    });
  } catch (err) {
    logger.error("User data export error", { error: err });
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 });
  }
}
