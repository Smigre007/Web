import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ShowcaseListClient } from "@/components/showcase/showcase-list-client";

export const metadata: Metadata = {
  title: "Showcase — NeuroCode AI",
  description: "Veja projetos reais criados por usuários do NeuroCode AI. Aplicativos, sites e sistemas gerados com IA em minutos.",
};

interface ShowcaseProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  prompt: string;
  tech_stack: string[] | null;
  showcase_slug: string;
  showcase_screenshot_url: string | null;
  created_at: string;
}

async function getPublicProjects(): Promise<ShowcaseProject[]> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("projects")
      .select("id, name, description, type, prompt, tech_stack, showcase_slug, showcase_screenshot_url, created_at")
      .eq("is_public", true)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(24);
    return (data ?? []) as ShowcaseProject[];
  } catch {
    return [];
  }
}

export default async function ShowcasePage() {
  const projects = await getPublicProjects();
  return <ShowcaseListClient projects={projects} />;
}
