import type { ProjectType } from "@/types";

/** IDs válidos para tipo de projeto (alinhado a `ProjectType` e às rotas API). */
export const PROJECT_TYPE_IDS = [
  "website",
  "webapp",
  "mobile",
  "saas",
  "landing",
  "dashboard",
  "api",
  "automation",
  "platform",
] as const satisfies readonly ProjectType[];

export type ProjectTypeId = (typeof PROJECT_TYPE_IDS)[number];

/** Valor inicial quando não há preferências guardadas (Configurações + gerador). */
export const DEFAULT_PROJECT_TYPE: ProjectTypeId = "webapp";

export function isProjectTypeId(value: unknown): value is ProjectType {
  return typeof value === "string" && (PROJECT_TYPE_IDS as readonly string[]).includes(value);
}
