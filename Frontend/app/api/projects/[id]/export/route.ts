import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const db = getSupabaseAdmin();

    const { data: project, error } = await db
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    const zip = new JSZip();

    const codeData = project.generated_code;
    const files: Array<{ path: string; content: string }> = codeData?.files ?? [];

    if (files.length === 0) {
      return NextResponse.json({ error: "Projeto sem arquivos" }, { status: 400 });
    }

    // Add each file to the ZIP
    for (const file of files) {
      zip.file(file.path, file.content ?? "");
    }

    // Add a README
    const techStack: string[] = project.tech_stack ?? codeData?.tech_stack ?? [];
    const readme = [
      `# ${project.name}`,
      "",
      project.description ?? "",
      "",
      "## Gerado por NeuroCode AI",
      "",
      `**Stack:** ${techStack.join(", ") || "Web"}`,
      "",
      "## Como usar",
      "",
      "1. Extraia todos os arquivos",
      "2. Abra o `index.html` no seu navegador (ou configure um servidor local)",
      "3. Personalize conforme necessário",
      "",
      "---",
      "_Gerado com ❤️ pelo NeuroCode AI_",
    ].join("\n");

    zip.file("README.md", readme);

    const zipBuffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const safeName = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}.zip"`,
        "Content-Length": zipBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    logger.error("Export error", { error: err });
    return NextResponse.json({ error: "Erro ao exportar projeto" }, { status: 500 });
  }
}
