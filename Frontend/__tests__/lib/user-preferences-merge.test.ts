import { describe, it, expect } from "vitest";
import { mergePreferencesFromRow } from "@/lib/user-preferences-merge";

describe("mergePreferencesFromRow", () => {
  it("usa first_name e last_name quando o JSON não tem nomes", () => {
    const { preferences, email } = mergePreferencesFromRow({
      preferences: { codeTheme: "dark" },
      email: "a@b.co",
      first_name: "Ana",
      last_name: "Silva",
    });
    expect(preferences.firstName).toBe("Ana");
    expect(preferences.lastName).toBe("Silva");
    expect(preferences.codeTheme).toBe("dark");
    expect(email).toBe("a@b.co");
  });

  it("não sobrescreve nomes já definidos no JSON", () => {
    const { preferences } = mergePreferencesFromRow({
      preferences: { firstName: "João", lastName: "Souza" },
      first_name: "Ignorado",
      last_name: "Ignorado",
    });
    expect(preferences.firstName).toBe("João");
    expect(preferences.lastName).toBe("Souza");
  });

  it("faz split de name legado quando não há nomes", () => {
    const { preferences } = mergePreferencesFromRow({
      preferences: {},
      name: "Maria Clara Santos",
    });
    expect(preferences.firstName).toBe("Maria");
    expect(preferences.lastName).toBe("Clara Santos");
  });
});
