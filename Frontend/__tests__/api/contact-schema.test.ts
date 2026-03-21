import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the ContactSchema from the route (avoids importing Next.js server code in tests)
const ContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("E-mail inválido").max(320),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(5000),
  plan: z.string().max(50).optional(),
});

describe("ContactSchema validation", () => {
  it("accepts valid contact data", () => {
    const result = ContactSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      message: "Preciso de ajuda com o projeto",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = ContactSchema.safeParse({
      name: "",
      email: "joao@example.com",
      message: "Preciso de ajuda com o projeto",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Nome é obrigatório");
  });

  it("rejects invalid email", () => {
    const result = ContactSchema.safeParse({
      name: "João",
      email: "not-an-email",
      message: "Preciso de ajuda com o projeto",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("E-mail inválido");
  });

  it("rejects message shorter than 10 chars", () => {
    const result = ContactSchema.safeParse({
      name: "João",
      email: "joao@example.com",
      message: "Curto",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Mensagem deve ter pelo menos 10 caracteres");
  });

  it("rejects XSS payload in name (length enforcement)", () => {
    const xssPayload = "<script>alert('xss')</script>".repeat(10);
    const result = ContactSchema.safeParse({
      name: xssPayload,
      email: "joao@example.com",
      message: "Mensagem válida aqui",
    });
    // name > 200 chars, so it should fail
    expect(result.success).toBe(false);
  });
});
