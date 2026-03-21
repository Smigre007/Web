import { describe, it, expect } from "vitest";
import { isMissingTableOrSchemaError } from "@/lib/supabase-errors";

describe("isMissingTableOrSchemaError", () => {
  it("detects PostgREST schema cache message", () => {
    expect(
      isMissingTableOrSchemaError(
        "Could not find the table 'public.users' in the schema cache"
      )
    ).toBe(true);
  });

  it("detects PGRST205 relation missing", () => {
    expect(isMissingTableOrSchemaError("PGRST205: relation does not exist")).toBe(
      true
    );
  });

  it("returns false for generic errors", () => {
    expect(isMissingTableOrSchemaError("JWT expired")).toBe(false);
    expect(isMissingTableOrSchemaError(undefined)).toBe(false);
  });
});
