import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  THEME_STORAGE_KEY,
  NEUROCODE_PREFS_KEY,
  resolveUiThemeFromStorage,
  isUiTheme,
} from "@/lib/theme-storage";

describe("resolveUiThemeFromStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("prefere a chave direta neurocode-landing-theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    localStorage.setItem(
      NEUROCODE_PREFS_KEY,
      JSON.stringify({ uiTheme: "light" })
    );
    expect(resolveUiThemeFromStorage()).toBe("dark");
  });

  it("usa uiTheme em neurocode-prefs se a chave direta não existir", () => {
    localStorage.setItem(
      NEUROCODE_PREFS_KEY,
      JSON.stringify({ uiTheme: "dark", language: "pt-BR" })
    );
    expect(resolveUiThemeFromStorage()).toBe("dark");
  });

  it("aceita monokai e dracula", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "monokai");
    expect(resolveUiThemeFromStorage()).toBe("monokai");
    localStorage.setItem(THEME_STORAGE_KEY, "dracula");
    expect(resolveUiThemeFromStorage()).toBe("dracula");
  });

  it("retorna null se não houver tema guardado", () => {
    expect(resolveUiThemeFromStorage()).toBeNull();
  });
});

describe("isUiTheme", () => {
  it("valida os quatro temas", () => {
    expect(isUiTheme("light")).toBe(true);
    expect(isUiTheme("dark")).toBe(true);
    expect(isUiTheme("monokai")).toBe(true);
    expect(isUiTheme("dracula")).toBe(true);
    expect(isUiTheme("foo")).toBe(false);
  });
});
