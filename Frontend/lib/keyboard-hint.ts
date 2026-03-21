/** Hint for command palette / shortcuts: ⌘ on Apple platforms, Ctrl elsewhere. */
export function modifierPlusKLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl+K";
  const p = navigator.platform ?? "";
  const ua = navigator.userAgent ?? "";
  if (/Mac|iPhone|iPad|iPod/.test(p) || /Mac OS/.test(ua)) return "⌘K";
  return "Ctrl+K";
}
