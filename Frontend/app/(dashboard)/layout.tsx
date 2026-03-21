import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { DashboardPreferencesSync } from "@/components/dashboard/dashboard-preferences-sync";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      <DashboardPreferencesSync />
      <DashboardSidebar />
      <main className="flex-1 overflow-auto min-h-0">{children}</main>
      <OnboardingModal />
      <CommandPalette />
    </div>
  );
}
