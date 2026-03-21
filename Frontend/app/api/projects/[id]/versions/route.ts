import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// GET /api/projects/[id]/versions — list all versions for a project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const db = getSupabaseAdmin();

    // Verify ownership
    const { data: project } = await db
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .single();
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    const { data, error } = await db
      .from("project_versions")
      .select("id, version_number, prompt, created_at")
      .eq("project_id", id)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    logger.error("Error fetching versions", { error: err });
    return NextResponse.json({ error: "Erro ao buscar versões" }, { status: 500 });
  }
}

// POST /api/projects/[id]/versions/restore — restore a version
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const { versionId } = await req.json();

    const db = getSupabaseAdmin();

    // Verify ownership
    const { data: project } = await db
      .from("projects")
      .select("id, generated_code, prompt")
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .single();
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    // Fetch the requested version
    const { data: version } = await db
      .from("project_versions")
      .select("*")
      .eq("id", versionId)
      .eq("project_id", id)
      .single();
    if (!version) return NextResponse.json({ error: "Versão não encontrada" }, { status: 404 });

    // Save current state as a new version before restoring
    const { data: latestVersion } = await db
      .from("project_versions")
      .select("version_number")
      .eq("project_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (latestVersion?.version_number ?? 0) + 1;

    await db.from("project_versions").insert({
      project_id: id,
      version_number: nextVersionNumber,
      generated_code: project.generated_code,
      prompt: project.prompt,
    });

    // Restore the selected version
    await db
      .from("projects")
      .update({
        generated_code: version.generated_code,
        prompt: version.prompt,
        status: "completed",
      })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Error restoring version", { error: err });
    return NextResponse.json({ error: "Erro ao restaurar versão" }, { status: 500 });
  }
}
