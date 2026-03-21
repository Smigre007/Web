import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Grava o estado anterior de `generated_code` em `project_versions` antes de sobrescrever (PATCH).
 */
export async function snapshotProjectVersionBeforeCodeUpdate(
  db: SupabaseClient,
  projectId: string,
  previousGeneratedCode: unknown,
  previousPrompt: string | null
): Promise<void> {
  if (previousGeneratedCode == null && !previousPrompt) return;

  const { data: maxRow } = await db
    .from("project_versions")
    .select("version_number")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const next = (maxRow?.version_number ?? 0) + 1;

  const { error } = await db.from("project_versions").insert({
    project_id: projectId,
    version_number: next,
    generated_code: previousGeneratedCode ?? {},
    prompt: previousPrompt ?? "",
  });

  if (error) {
    throw error;
  }
}
