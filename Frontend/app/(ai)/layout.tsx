import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AiWorkspaceChrome } from "@/components/ai/ai-workspace-chrome";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { DashboardPreferencesSync } from "@/components/dashboard/dashboard-preferences-sync";

/**
 * Área de trabalho das IAs: autenticada, sem sidebar do Dashboard.
 * O Dashboard (/dashboard) concentra métricas e dados reais; aqui só as interfaces de geração e chat.
 */
export default async function AiWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-0 h-dvh max-h-dvh flex-col overflow-hidden bg-cream">
      <DashboardPreferencesSync />
      <AiWorkspaceChrome />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      <OnboardingModal />
      <CommandPalette />
    </div>
  );
}
