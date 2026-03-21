import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Simple in-memory cache — refreshes every 5 minutes
let cached: { data: Record<string, unknown>; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  // Serve cached response if fresh
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  try {
    const db = getSupabaseAdmin();

    const [usersRes, projectsRes] = await Promise.all([
      db.from("users").select("id", { count: "exact", head: true }),
      db.from("projects").select("id", { count: "exact", head: true }),
    ]);

    const data = {
      users: usersRes.count ?? 0,
      projects: projectsRes.count ?? 0,
      types: 9, // static — number of supported project types
    };

    cached = { data, at: Date.now() };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    // DB not configured — return zeros (landing page will show fallback values)
    return NextResponse.json({ users: 0, projects: 0, types: 9 });
  }
}
