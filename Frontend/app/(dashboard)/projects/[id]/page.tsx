import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/dashboard/project-editor";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_clerk_id", userId)
    .single();

  if (!project) notFound();

  return <ProjectEditor project={project} />;
}
