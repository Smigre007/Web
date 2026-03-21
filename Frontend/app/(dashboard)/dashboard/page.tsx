import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardClientV2 } from "@/components/dashboard/dashboard-client-v2";

function DashboardFallback() {
  return (
    <div
      className="flex flex-col gap-4 px-4 sm:px-6 py-10 animate-pulse"
      aria-busy="true"
      aria-label="Carregando painel"
    >
      <div className="h-8 bg-ink/[0.06] rounded-lg w-64 max-w-full" />
      <div className="h-24 bg-ink/[0.06] rounded-2xl" />
      <div className="h-40 bg-ink/[0.06] rounded-2xl" />
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; type?: string }>;
}) {
  const [user, params] = await Promise.all([currentUser(), searchParams]);
  if (params.tab === "generate") {
    const q = params.type
      ? `?type=${encodeURIComponent(params.type)}`
      : "";
    redirect(`/gerar${q}`);
  }
  if (params.tab === "chat") {
    redirect("/chat-ia");
  }
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClientV2 userName={user?.firstName || "criador"} initialTab={params.tab} />
    </Suspense>
  );
}
