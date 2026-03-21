import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  ShieldCheck,
  Users,
  FolderOpen,
  TrendingUp,
  Mail,
  Crown,
  Zap,
  Rocket,
} from "lucide-react";

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) ?? [];

// ── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  type: string | null;
  status: string | null;
  created_at: string;
}

interface ContactRequest {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

interface UserRow {
  plan: string | null;
  generations_used: number | null;
  generations_limit: number | null;
  full_name: string | null;
  email: string | null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-cream border border-ink-15 rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-ink leading-none">{value}</p>
        <p className="text-xs uppercase tracking-wider text-ink-35 font-medium mt-1">{label}</p>
        <p className="text-xs text-ink-35 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = "from-gold to-gold-lt" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-ink/[0.05] overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    free: "bg-ink/[0.06] text-ink-35 border-ink-15",
    starter: "bg-gold/[0.12] text-gold border-gold/30",
    pro: "bg-ink text-cream border-ink",
  };
  const cls = map[plan?.toLowerCase()] ?? map.free;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {plan ?? "free"}
    </span>
  );
}

// ── Page (Server Component) ───────────────────────────────────────────────────

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    // Non-admin: show access denied instead of redirecting to avoid exposing route existence
    return (
      <div className="p-6 max-w-lg mx-auto mt-16">
        <div className="bg-cream border border-ink-15 rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ink/[0.05] border border-ink-15 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-ink-35" />
          </div>
          <h1 className="text-xl font-black text-ink">Acesso Negado</h1>
          <p className="text-sm text-ink-35 leading-relaxed">
            Você não tem permissão para acessar o painel administrativo.
            <br />
            Se acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  const supabase = getSupabaseAdmin();

  const [
    { count: totalUsers },
    { data: projects },
    { data: contacts },
    { data: users },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("id, type, status, created_at"),
    supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("users")
      .select("plan, generations_used, generations_limit, full_name, email")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const safeProjects: Project[] = projects ?? [];
  const safeContacts: ContactRequest[] = contacts ?? [];
  const safeUsers: UserRow[] = users ?? [];

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalProjects = safeProjects.length;
  const completedProjects = safeProjects.filter((p) => p.status === "completed").length;
  const completionRate =
    totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Users by plan
  const byPlan: Record<string, number> = {};
  for (const u of safeUsers) {
    const plan = u.plan ?? "free";
    byPlan[plan] = (byPlan[plan] ?? 0) + 1;
  }

  // Projects by type
  const byType: Record<string, number> = {};
  for (const p of safeProjects) {
    const type = p.type ?? "outros";
    byType[type] = (byType[type] ?? 0) + 1;
  }
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 7);

  const planOrder = ["free", "starter", "pro"];
  const planEntries = planOrder
    .filter((k) => byPlan[k] !== undefined)
    .map((k) => [k, byPlan[k]] as [string, number]);

  const PLAN_ICONS: Record<string, React.ElementType> = {
    free: Zap,
    starter: Rocket,
    pro: Crown,
  };

  const PLAN_COLORS: Record<string, string> = {
    free: "text-ink-35",
    starter: "text-gold",
    pro: "text-ink",
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-gold" />
            Painel Admin
          </h1>
          <p className="text-ink-35 mt-1 text-sm">
            Visão geral da plataforma NeuroCode — dados em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/[0.10] border border-gold/25">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-semibold text-gold">Admin</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total Usuários"
          value={(totalUsers ?? 0).toLocaleString("pt-BR")}
          sub={`${safeUsers.length} recentes`}
          icon={Users}
          accent="bg-ink/[0.05] text-ink-35"
        />
        <KpiCard
          label="Total Projetos"
          value={totalProjects.toLocaleString("pt-BR")}
          sub={`${completedProjects} concluídos`}
          icon={FolderOpen}
          accent="bg-gold/[0.10] text-gold"
        />
        <KpiCard
          label="Taxa de Conclusão"
          value={`${completionRate}%`}
          sub={`${totalProjects - completedProjects} em andamento`}
          icon={TrendingUp}
          accent="bg-ink/[0.05] text-ink-35"
        />
        <KpiCard
          label="Msgs Recebidas"
          value={safeContacts.length.toString()}
          sub="últimas 10 mensagens"
          icon={Mail}
          accent="bg-gold/[0.10] text-gold"
        />
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Usuários por Plano */}
        <div className="bg-cream border border-ink-15 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-gold" />
            Usuários por Plano
          </h2>
          <div className="space-y-4">
            {planEntries.map(([plan, count]) => {
              const pct =
                (totalUsers ?? 0) > 0
                  ? Math.round((count / (totalUsers ?? 1)) * 100)
                  : 0;
              const Icon = PLAN_ICONS[plan] ?? Zap;
              const color = PLAN_COLORS[plan] ?? "text-ink-35";
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 ${color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {plan}
                    </span>
                    <span className="text-xs text-ink-35">
                      {count}{" "}
                      <span className="text-ink/30">({pct}%)</span>
                    </span>
                  </div>
                  <ProgressBar
                    pct={pct}
                    color={
                      plan === "pro"
                        ? "from-ink to-ink-60"
                        : plan === "starter"
                        ? "from-gold to-gold-lt"
                        : "from-ink/20 to-ink/10"
                    }
                  />
                </div>
              );
            })}
            {planEntries.length === 0 && (
              <p className="text-sm text-ink-35 text-center py-4">
                Nenhum dado de plano disponível.
              </p>
            )}
          </div>
        </div>

        {/* Projetos por Tipo */}
        <div className="bg-cream border border-ink-15 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
            <FolderOpen className="w-4 h-4 text-gold" />
            Projetos por Tipo
          </h2>
          <div className="space-y-4">
            {typeEntries.map(([type, count]) => {
              const pct =
                totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs uppercase tracking-wider font-medium text-ink-35 capitalize">
                      {type}
                    </span>
                    <span className="text-xs text-ink-35">
                      {count}{" "}
                      <span className="text-ink/30">({pct}%)</span>
                    </span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              );
            })}
            {typeEntries.length === 0 && (
              <p className="text-sm text-ink-35 text-center py-4">
                Nenhum projeto encontrado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Contacts Table */}
      <div className="bg-cream border border-ink-15 rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
          <Mail className="w-4 h-4 text-gold" />
          Contatos Recentes
        </h2>
        {safeContacts.length === 0 ? (
          <p className="text-sm text-ink-35 text-center py-8">
            Nenhuma mensagem recebida ainda.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-15">
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Nome
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Email
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium hidden md:table-cell">
                    Mensagem
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {safeContacts.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`${
                      i > 0 ? "border-t border-ink/[0.04]" : ""
                    } hover:bg-ink/[0.02] transition-colors`}
                  >
                    <td className="px-3 py-3 font-medium text-ink">
                      {c.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-ink-35 text-xs">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-ink-35 hidden md:table-cell max-w-xs">
                      <span className="line-clamp-1">
                        {c.message ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink-35 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Users Table */}
      <div className="bg-cream border border-ink-15 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-gold" />
          Usuários Recentes
        </h2>
        {safeUsers.length === 0 ? (
          <p className="text-sm text-ink-35 text-center py-8">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-15">
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Nome
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Plano
                  </th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-ink-35 font-medium">
                    Gerações Usadas
                  </th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.map((u, i) => {
                  const used = u.generations_used ?? 0;
                  const limit = u.generations_limit ?? 3;
                  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                  return (
                    <tr
                      key={i}
                      className={`${
                        i > 0 ? "border-t border-ink/[0.04]" : ""
                      } hover:bg-ink/[0.02] transition-colors`}
                    >
                      <td className="px-3 py-3 font-medium text-ink">
                        {u.full_name ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-ink-35 text-xs hidden sm:table-cell">
                        {u.email ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <PlanBadge plan={u.plan ?? "free"} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1">
                            <ProgressBar pct={pct} />
                          </div>
                          <span className="text-xs text-ink-35 whitespace-nowrap">
                            {used}/{limit}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
