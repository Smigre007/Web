import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ShowcaseDetailClient } from "@/components/showcase/showcase-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("projects")
      .select("id, name, description, type, prompt, tech_stack, preview_html, created_at, generated_code")
      .eq("showcase_slug", slug)
      .eq("is_public", true)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} — NeuroCode AI Showcase`,
    description: project.description ?? `${project.name} criado com NeuroCode AI`,
  };
}

export default async function ShowcaseProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const dashboardLink = `/gerar?type=${encodeURIComponent(project.type)}&prompt=${encodeURIComponent(project.prompt)}`;
  return <ShowcaseDetailClient project={project} dashboardLink={dashboardLink} />;
}
