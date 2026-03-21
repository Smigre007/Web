/**
 * Merge JSONB `users.preferences` with column fallbacks (first_name, last_name, legacy name).
 */

export type UserPrefsRow = {
  preferences?: Record<string, unknown> | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  /** Legacy column; optional */
  name?: string | null;
};

export function mergePreferencesFromRow(data: UserPrefsRow): {
  preferences: Record<string, unknown>;
  email: string | null;
} {
  const prefs: Record<string, unknown> = { ...(data.preferences ?? {}) };

  const hasFirst =
    typeof prefs.firstName === "string" && prefs.firstName.trim() !== "";
  const hasLast =
    typeof prefs.lastName === "string" && prefs.lastName.trim() !== "";

  if (!hasFirst && data.first_name) {
    prefs.firstName = data.first_name;
  }
  if (!hasLast && data.last_name) {
    prefs.lastName = data.last_name;
  }

  if (
    (!prefs.firstName || String(prefs.firstName).trim() === "") &&
    (!prefs.lastName || String(prefs.lastName).trim() === "") &&
    data.name
  ) {
    const parts = String(data.name).split(/\s+/);
    prefs.firstName = parts[0] ?? "";
    prefs.lastName = parts.slice(1).join(" ") ?? "";
  }

  return {
    preferences: prefs,
    email: data.email ?? null,
  };
}
