import { describe, it, expect } from "vitest";
import { z } from "zod";
import { PROJECT_TYPE_IDS, DEFAULT_PROJECT_TYPE } from "@/lib/project-types";

const GenerateBodySchema = z.object({
  prompt: z.string().min(10, "Descreva seu projeto com pelo menos 10 caracteres").max(5000),
  projectType: z.enum(PROJECT_TYPE_IDS).optional().default(DEFAULT_PROJECT_TYPE),
});

describe("GenerateBodySchema validation", () => {
  it("accepts a valid prompt", () => {
    const result = GenerateBodySchema.safeParse({
      prompt: "Crie um site de portfólio moderno",
      projectType: "website",
    });
    expect(result.success).toBe(true);
  });

  it("rejects prompt shorter than 10 chars", () => {
    const result = GenerateBodySchema.safeParse({ prompt: "Short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Descreva seu projeto com pelo menos 10 caracteres");
  });

  it("rejects prompt longer than 5000 chars", () => {
    const result = GenerateBodySchema.safeParse({ prompt: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid project type", () => {
    const result = GenerateBodySchema.safeParse({
      prompt: "Crie um site de portfólio moderno",
      projectType: "invalid-type",
    });
    expect(result.success).toBe(false);
  });

  it("defaults projectType to DEFAULT_PROJECT_TYPE when omitted", () => {
    const result = GenerateBodySchema.safeParse({
      prompt: "Crie um site de portfólio moderno",
    });
    expect(result.success).toBe(true);
    expect(result.data?.projectType).toBe(DEFAULT_PROJECT_TYPE);
  });
});
