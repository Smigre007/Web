import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mergePrefsIntoLocalStorage,
  readLocalPrefsJson,
  NEUROCODE_PREFS_KEY,
  CODE_THEME_EVENT,
  DEFAULT_PROJECT_TYPE_EVENT,
} from "@/lib/neurocode-prefs-local";

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
}

describe("neurocode-prefs-local", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("mergePrefsIntoLocalStorage grava JSON e dispara evento de tema", async () => {
    const spyTheme = vi.fn();
    const spyProject = vi.fn();
    window.addEventListener(CODE_THEME_EVENT, spyTheme);
    window.addEventListener(DEFAULT_PROJECT_TYPE_EVENT, spyProject);

    mergePrefsIntoLocalStorage({ codeTheme: "dracula", defaultProjectType: "saas" });

    await flushMicrotasks();

    const raw = localStorage.getItem(NEUROCODE_PREFS_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as Record<string, unknown>;
    expect(parsed.codeTheme).toBe("dracula");
    expect(parsed.defaultProjectType).toBe("saas");
    expect(localStorage.getItem("neurocode-code-theme")).toBe("dracula");
    expect(spyTheme).toHaveBeenCalled();
    const ev = spyTheme.mock.calls[0]?.[0] as CustomEvent<string>;
    expect(ev.detail).toBe("dracula");
    expect(spyProject).toHaveBeenCalled();
    const evP = spyProject.mock.calls[0]?.[0] as CustomEvent<string>;
    expect(evP.detail).toBe("saas");
  });

  it("readLocalPrefsJson devolve objeto vazio se não houver dados", () => {
    expect(readLocalPrefsJson()).toEqual({});
  });
});
