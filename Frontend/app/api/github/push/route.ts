import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { decryptToken } from "@/app/api/github/callback/route";

interface CodeFile {
  path: string;
  content: string;
}

async function githubRequest(url: string, token: string, method = "GET", body?: unknown) {
  const res = await fetch(`https://api.github.com${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `GitHub API error ${res.status}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { projectId, repoName, isPrivate = false } = await req.json();
    if (!projectId || !repoName) {
      return NextResponse.json({ error: "projectId e repoName são obrigatórios" }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Fetch user + token
    const { data: user } = await db
      .from("users")
      .select("github_access_token, github_username, plan")
      .eq("clerk_id", userId)
      .single();

    if (!user?.github_access_token) {
      return NextResponse.json({ error: "GitHub não conectado. Conecte sua conta em Configurações." }, { status: 400 });
    }

    if (user.plan === "free") {
      return NextResponse.json({ error: "GitHub integration requer plano Starter ou superior." }, { status: 403 });
    }

    const token = decryptToken(user.github_access_token);

    // Fetch project
    const { data: project } = await db
      .from("projects")
      .select("name, generated_code, prompt")
      .eq("id", projectId)
      .eq("user_clerk_id", userId)
      .single();

    if (!project?.generated_code) {
      return NextResponse.json({ error: "Projeto sem código gerado" }, { status: 400 });
    }

    const generatedCode = project.generated_code as { files?: CodeFile[]; summary?: string };
    const files: CodeFile[] = generatedCode.files ?? [];

    // Create repo
    const safeRepoName = repoName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);

    const repo = await githubRequest("/user/repos", token, "POST", {
      name: safeRepoName,
      description: generatedCode.summary ?? project.name,
      private: isPrivate,
      auto_init: false,
    });

    const owner: string = repo.owner.login;

    // Push files
    const pushFile = async (file: CodeFile) => {
      const content = Buffer.from(file.content, "utf8").toString("base64");
      await githubRequest(`/repos/${owner}/${safeRepoName}/contents/${file.path}`, token, "PUT", {
        message: `feat: add ${file.path}`,
        content,
      });
    };

    // Push README first, then rest sequentially to avoid race conditions
    const readme = files.find((f) => f.path.toLowerCase() === "readme.md");
    if (readme) await pushFile(readme);
    for (const file of files.filter((f) => f.path.toLowerCase() !== "readme.md")) {
      await pushFile(file);
    }

    const repoUrl: string = repo.html_url;

    // Save repo URL to project
    await db
      .from("projects")
      .update({ github_repo_url: repoUrl, github_repo_name: safeRepoName })
      .eq("id", projectId);

    return NextResponse.json({ repoUrl, repoName: safeRepoName });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao fazer push para GitHub";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
