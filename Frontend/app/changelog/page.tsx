import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ChangelogView } from "@/components/changelog/changelog-view";
import { CHANGELOG_UI } from "@/lib/changelog-data";
import { isLanguageCode, LANG_COOKIE_NAME } from "@/lib/locale-html";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LANG_COOKIE_NAME)?.value;
  const lang = isLanguageCode(raw) ? raw : "pt";
  const ui = CHANGELOG_UI[lang];
  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
  };
}

export default function ChangelogPage() {
  return <ChangelogView />;
}
