"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  Settings,
  Bell,
  Globe,
  Code2,
  Check,
  Loader2,
  Download,
  Trash2,
  Shield,
  ExternalLink,
  AlertTriangle,
  User,
  Phone,
  Briefcase,
  Clock,
  FileText,
  Lock,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import { mergePrefsIntoLocalStorage } from "@/lib/neurocode-prefs-local";
import { prefLanguageToContext } from "@/lib/pref-language";
import { isUiTheme, type UiTheme } from "@/lib/theme-storage";
import { DEFAULT_PROJECT_TYPE } from "@/lib/project-types";

const SESSION_PREFS_DIRTY_KEY = "neurocode-settings-prefs-dirty";

/** Cada tema do editor tem interface correspondente (não reutiliza só o dark editorial). */
function uiThemeFromCodeTheme(codeTheme: Prefs["codeTheme"]): UiTheme {
  switch (codeTheme) {
    case "light":
      return "light";
    case "dark":
      return "dark";
    case "monokai":
      return "monokai";
    case "dracula":
      return "dracula";
    default:
      return "dark";
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Prefs {
  language: string;
  /** Tema da interface (landing + dashboard): editorial, Monokai ou Dracula */
  uiTheme: UiTheme;
  codeTheme: "dark" | "light" | "monokai" | "dracula";
  defaultProjectType: string;
  emailNotifications: boolean;
  generationAlerts: boolean;
  marketing: boolean;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  timezone: string;
  bio: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PREFS: Prefs = {
  language: "pt-BR",
  uiTheme: "light",
  codeTheme: "dark",
  defaultProjectType: DEFAULT_PROJECT_TYPE,
  emailNotifications: true,
  generationAlerts: true,
  marketing: false,
};

const DEFAULT_PROFILE: ProfileForm = {
  firstName: "",
  lastName: "",
  phone: "",
  role: "",
  timezone: "America/Sao_Paulo",
  bio: "",
};

const PROJECT_TYPES = [
  { id: "website", label: "Website" },
  { id: "landing", label: "Landing Page" },
  { id: "webapp", label: "Web App" },
  { id: "saas", label: "SaaS" },
  { id: "dashboard", label: "Dashboard" },
  { id: "api", label: "API / Backend" },
  { id: "mobile", label: "Mobile App" },
  { id: "automation", label: "Automação" },
  { id: "platform", label: "Plataforma" },
];

const CODE_THEMES = [
  { id: "dark" as const, label: "Dark", preview: "bg-[#282c34]", accent: "text-[#61dafb]" },
  { id: "light" as const, label: "Light", preview: "bg-[#fafafa]", accent: "text-[#4078f2]" },
  { id: "monokai" as const, label: "Monokai", preview: "bg-[#272822]", accent: "text-[#a6e22e]" },
  { id: "dracula" as const, label: "Dracula", preview: "bg-[#282a36]", accent: "text-[#bd93f9]" },
];

const LANGUAGES = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷", available: true },
  { code: "en", label: "English", flag: "🇺🇸", available: true },
  { code: "es", label: "Español", flag: "🇪🇸", available: true },
  { code: "fr", label: "Français", flag: "🇫🇷", available: true },
];

const ROLES = [
  "Desenvolvedor(a) Frontend",
  "Desenvolvedor(a) Backend",
  "Desenvolvedor(a) Full Stack",
  "Designer de Produto",
  "Gerente de Produto",
  "Empreendedor(a)",
  "Estudante",
  "Outro",
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasil (GMT-3)" },
  { value: "America/New_York", label: "Nova York (GMT-5)" },
  { value: "America/Chicago", label: "Chicago (GMT-6)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tóquio (GMT+9)" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${value ? "bg-gold" : "bg-ink/[0.12]"}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-cream border border-ink-15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <Icon className="w-4 h-4 text-gold" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs uppercase tracking-wider text-ink-60 font-medium block mb-1.5">
      {children}
    </label>
  );
}

function FieldInput({
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
  className,
}: {
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 border border-ink-15 rounded-xl bg-cream text-ink text-sm focus:outline-none focus:border-gold/60 transition-colors ${
        readOnly ? "bg-cream-2 text-ink-35 cursor-not-allowed" : ""
      } ${className ?? ""}`}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { setTheme } = useTheme();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";

  const labels = {
    pt: {
      title: "Configurações",
      subtitle: "Gerencie sua conta, preferências e privacidade",
      tabProfile: "Perfil",
      tabPreferences: "Preferências",
      tabPrivacy: "Privacidade",
    },
    en: {
      title: "Settings",
      subtitle: "Manage your account, preferences and privacy",
      tabProfile: "Profile",
      tabPreferences: "Preferences",
      tabPrivacy: "Privacy",
    },
    es: {
      title: "Configuración",
      subtitle: "Gestiona tu cuenta, preferencias y privacidad",
      tabProfile: "Perfil",
      tabPreferences: "Preferencias",
      tabPrivacy: "Privacidad",
    },
    fr: {
      title: "Paramètres",
      subtitle: "Gérez votre compte, préférences et confidentialité",
      tabProfile: "Profil",
      tabPreferences: "Préférences",
      tabPrivacy: "Confidentialité",
    },
  }[lang];

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "privacy">("profile");

  // ── Preferências ────────────────────────────────────────────────────────────
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const userTouchedRef = useRef(false);

  // ── Perfil ──────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const prefsSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Conta / exclusão ────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { signOut } = useClerk();
  const router = useRouter();

  // ── Carregar preferências + perfil do banco ──────────────────────────────────
  useEffect(() => {
    // Valores locais como fallback imediato
    try {
      const saved = localStorage.getItem("neurocode-prefs");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Prefs>;
        delete parsed.language;
        setPrefs((p) => ({ ...p, ...parsed }));
        const localUi = parsed.uiTheme;
        if (isUiTheme(localUi)) {
          setTheme(localUi);
          mergePrefsIntoLocalStorage({ uiTheme: localUi });
        }
      }
    } catch {
      /* ignora */
    }

    // Busca dados reais do banco
    let cancelled = false;
    fetch("/api/user/preferences")
      .then(async (r) => {
        const data = (await r.json()) as {
          error?: string;
          preferences?: Partial<Prefs & ProfileForm>;
          email?: string;
        };
        if (!r.ok) {
          if (!cancelled) {
            toast.error("Não foi possível carregar as preferências do servidor.", {
              description: data.error ?? `Código ${r.status}. Os dados locais são mantidos.`,
            });
          }
          return null;
        }
        return data;
      })
      .then(
        (
          data: {
            preferences?: Partial<Prefs & ProfileForm>;
            email?: string;
          } | null
        ) => {
          if (cancelled || !data) return;
          const sessionDirty =
            typeof window !== "undefined" &&
            sessionStorage.getItem(SESSION_PREFS_DIRTY_KEY) === "1";
          const remote = data.preferences ?? {};
          const langFromRemote = (remote as Partial<Prefs>).language;
          const {
            firstName,
            lastName,
            phone,
            role,
            timezone,
            bio,
            ...remotePrefs
          } = remote as Partial<Prefs & ProfileForm>;

          if (!sessionDirty) {
            delete remotePrefs.language;
            const remoteUi = (remote as Partial<Prefs>).uiTheme;
            if (isUiTheme(remoteUi)) {
              setTheme(remoteUi);
            }
            setPrefs((p) => {
              const merged = { ...p, ...remotePrefs };
              mergePrefsIntoLocalStorage(merged as unknown as Record<string, unknown>);
              return merged;
            });
            if (langFromRemote) {
              setLanguage(prefLanguageToContext(langFromRemote));
            }
          } else {
            try {
              const raw = localStorage.getItem("neurocode-prefs");
              if (raw) {
                const parsed = JSON.parse(raw) as Partial<Prefs>;
                delete parsed.language;
                setPrefs((p) => ({ ...p, ...parsed }));
                const dirtyUi = parsed.uiTheme;
                if (isUiTheme(dirtyUi)) {
                  setTheme(dirtyUi);
                }
              }
            } catch {
              /* ignora */
            }
            if (langFromRemote) {
              setLanguage(prefLanguageToContext(langFromRemote));
            }
          }

          setProfile({
            firstName: firstName ?? "",
            lastName: lastName ?? "",
            phone: phone ?? "",
            role: role ?? "",
            timezone: timezone ?? "America/Sao_Paulo",
            bio: bio ?? "",
          });
          setProfileEmail(data.email ?? "");
        }
      )
      .catch(() => {
        /* rede / JSON */
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPrefs(false);
          setLoadingProfile(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setLanguage, setTheme]);

  const persistPrefsToServer = useCallback(
    async (
      prefsSnapshot: Prefs,
      opts: { silent?: boolean } = {}
    ): Promise<boolean> => {
      mergePrefsIntoLocalStorage(prefsSnapshot as unknown as Record<string, unknown>);
      try {
        const res = await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefsSnapshot),
        });
        const payload = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          code?: string;
        };
        if (!res.ok || payload.ok === false) {
          console.info("[NeuroCode preferências] servidor não gravou — copie isto:", {
            httpStatus: res.status,
            ...payload,
          });
          if (!opts.silent) {
            toast.warning("Guardado neste dispositivo", {
              description:
                payload.error ??
                "O servidor não gravou (ex.: coluna preferences em falta). As alterações ficam no browser.",
              duration: 12000,
              closeButton: true,
            });
          } else {
            toast.warning("Sincronização pendente", {
              id: "prefs-sync-warn",
              description:
                payload.error ?? "Servidor indisponível — dados só neste dispositivo.",
              duration: 12000,
              closeButton: true,
            });
          }
          return false;
        }
        try {
          sessionStorage.removeItem(SESSION_PREFS_DIRTY_KEY);
        } catch {
          /* */
        }
        setLanguage(prefLanguageToContext(prefsSnapshot.language));
        const ui = prefsSnapshot.uiTheme;
        if (isUiTheme(ui)) {
          setTheme(ui);
        }
        console.info("[NeuroCode preferências] OK — servidor gravou:", {
          httpStatus: res.status,
          ...payload,
        });
        if (!opts.silent) {
          toast.success("Preferências salvas!", {
            description: "Suas configurações foram atualizadas na conta.",
            duration: 8000,
            closeButton: true,
          });
        } else {
          toast.success("Sincronizado com a conta", {
            id: "prefs-cloud-sync",
            description: "Preferências guardadas no servidor.",
            duration: 6000,
            closeButton: true,
          });
        }
        return true;
      } catch (e) {
        console.info("[NeuroCode preferências] erro de rede:", e);
        if (!opts.silent) {
          toast.error("Erro de rede ao salvar.", { duration: 12000, closeButton: true });
        } else {
          toast.warning("Sem ligação — alterações só locais", {
            id: "prefs-net",
            duration: 12000,
            closeButton: true,
          });
        }
        return false;
      }
    },
    [setLanguage, setTheme]
  );

  const updatePref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    userTouchedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_PREFS_DIRTY_KEY, "1");
    } catch {
      /* private mode */
    }
    setPrefs((prev) => {
      let next = { ...prev, [key]: value };
      if (key === "codeTheme") {
        next = {
          ...next,
          uiTheme: uiThemeFromCodeTheme(value as Prefs["codeTheme"]),
        };
      }
      mergePrefsIntoLocalStorage(next as unknown as Record<string, unknown>);
      return next;
    });
    if (key === "language") {
      setLanguage(prefLanguageToContext(value as string));
    }
    if (key === "codeTheme") {
      setTheme(uiThemeFromCodeTheme(value as Prefs["codeTheme"]));
    }
  };

  // Guardar no servidor pouco depois de cada alteração (não depende só do botão)
  useEffect(() => {
    if (!userTouchedRef.current) return;
    if (prefsSaveTimerRef.current) clearTimeout(prefsSaveTimerRef.current);
    prefsSaveTimerRef.current = setTimeout(() => {
      void persistPrefsToServer(prefs, { silent: true });
    }, 700);
    return () => {
      if (prefsSaveTimerRef.current) clearTimeout(prefsSaveTimerRef.current);
    };
  }, [prefs, persistPrefsToServer]);

  // ── Salvar preferências no banco ─────────────────────────────────────────────
  const savePrefs = async () => {
    setSaving(true);
    try {
      await persistPrefsToServer(prefs, { silent: false });
    } finally {
      setSaving(false);
    }
  };

  // ── Salvar perfil no banco (real) ─────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        toast.error("Erro ao salvar perfil.", {
          description:
            payload.error ?? "Verifique sua conexão e tente novamente.",
        });
        return;
      }
      toast.success("Perfil atualizado!", {
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch {
      toast.error("Erro ao salvar perfil.", {
        description: "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Excluir conta ─────────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "EXCLUIR") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut();
      router.push("/");
    } catch {
      toast.error("Erro ao excluir conta. Tente novamente.");
      setDeleting(false);
    }
  };

  const TABS = [
    { id: "profile" as const, label: labels.tabProfile },
    { id: "preferences" as const, label: labels.tabPreferences },
    { id: "privacy" as const, label: labels.tabPrivacy },
  ];

  // ─ Avatar initials
  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : profile.firstName
      ? profile.firstName[0].toUpperCase()
      : "U";

  return (
    <div className="p-6 max-w-3xl mx-auto w-full pb-16">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink flex items-center gap-3">
          <Settings className="w-8 h-8 text-gold" />
          {labels.title}
        </h1>
        <p className="text-ink-35 mt-1 text-sm">{labels.subtitle}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-cream-2 rounded-2xl mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-cream shadow-sm text-ink"
                : "text-ink-35 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── PERFIL ──────────────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-5"
          >
            {loadingProfile && (
              <div className="flex items-center gap-2 text-ink-35 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando perfil...
              </div>
            )}

            {/* Avatar */}
            <SectionCard title="Foto de Perfil" icon={User}>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-ink text-cream flex items-center justify-center text-2xl font-black select-none flex-shrink-0 tracking-wider">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink mb-0.5">
                    {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Seu Nome"}
                  </p>
                  {profileEmail && (
                    <p className="text-xs text-ink-35 mb-2">{profileEmail}</p>
                  )}
                  <p className="text-xs text-ink-35">
                    Avatar gerado automaticamente a partir das suas iniciais.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Informações Pessoais */}
            <SectionCard
              title="Informações Pessoais"
              icon={User}
              action={
                <button
                  onClick={() =>
                    fetch("/api/user/preferences")
                      .then((r) => r.json())
                      .then((d) => {
                        const p = d.preferences ?? {};
                        setProfile({
                          firstName: p.firstName ?? "",
                          lastName: p.lastName ?? "",
                          phone: p.phone ?? "",
                          role: p.role ?? "",
                          timezone: p.timezone ?? "America/Sao_Paulo",
                          bio: p.bio ?? "",
                        });
                        toast.success("Perfil recarregado.");
                      })
                  }
                  className="p-1.5 text-ink-35 hover:text-ink rounded-lg hover:bg-cream-2 transition-colors"
                  title="Recarregar dados"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <FieldLabel>Nome</FieldLabel>
                  <FieldInput
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="Ex: Maria"
                  />
                </div>

                {/* Sobrenome */}
                <div>
                  <FieldLabel>Sobrenome</FieldLabel>
                  <FieldInput
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Ex: Silva"
                  />
                </div>

                {/* Email (read-only vindo do Clerk) */}
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <div className="relative">
                    <FieldInput
                      type="email"
                      value={profileEmail}
                      readOnly
                      placeholder="via Clerk"
                    />
                    <Lock className="w-3.5 h-3.5 text-ink-35 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-ink-35 mt-1">
                    Altere o email pelo{" "}
                    <Link
                      href="/settings/account"
                      className="text-gold underline underline-offset-2"
                    >
                      Clerk
                    </Link>
                  </p>
                </div>

                {/* Telefone */}
                <div>
                  <FieldLabel>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      Telefone
                    </span>
                  </FieldLabel>
                  <FieldInput
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+55 11 99999-9999"
                  />
                </div>

                {/* Cargo */}
                <div>
                  <FieldLabel>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" />
                      Cargo
                    </span>
                  </FieldLabel>
                  <select
                    value={profile.role}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-ink-15 rounded-xl bg-cream text-ink text-sm focus:outline-none focus:border-gold/60 transition-colors appearance-none"
                  >
                    <option value="">Selecione...</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuso Horário */}
                <div>
                  <FieldLabel>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Fuso Horário
                    </span>
                  </FieldLabel>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, timezone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-ink-15 rounded-xl bg-cream text-ink text-sm focus:outline-none focus:border-gold/60 transition-colors appearance-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-4 py-2.5 border border-ink-15 rounded-xl bg-cream text-ink text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
                />
                <p className="text-[11px] text-ink-35 mt-1 text-right">
                  {profile.bio.length}/500
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={saveProfile}
                  disabled={profileSaving || loadingProfile}
                  className="bg-ink text-cream rounded-xl px-4 py-2 text-sm font-medium hover:bg-ink/80 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar Perfil
                    </>
                  )}
                </button>
              </div>
            </SectionCard>

            {/* Nota Clerk */}
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-gold/[0.06] border border-gold/20 text-sm">
              <ExternalLink className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="text-ink-35">
                Para alterar email ou senha, acesse:{" "}
                <Link
                  href="/settings/account"
                  className="text-gold font-medium underline underline-offset-2"
                >
                  Perfil Clerk
                </Link>
              </span>
            </div>
          </motion.div>
        )}

        {/* ── PREFERÊNCIAS ──────────────────────────────────────────────────── */}
        {activeTab === "preferences" && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-5"
          >
            {loadingPrefs && (
              <div className="flex items-center gap-2 text-ink-35 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando preferências...
              </div>
            )}

            {/* Idioma */}
            <SectionCard title="Idioma da Interface" icon={Globe}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((l) => {
                  const active = prefs.language === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      disabled={!l.available}
                      onClick={() => l.available && updatePref("language", l.code)}
                      className={`relative border rounded-xl p-4 cursor-pointer text-left transition-all ${
                        !l.available
                          ? "opacity-50 cursor-not-allowed border-ink-15 bg-ink/[0.02]"
                          : active
                          ? "border-gold/60 bg-gold/[0.06]"
                          : "border-ink-15 hover:border-ink/20 hover:bg-cream-2"
                      }`}
                    >
                      <p className="text-lg mb-1">{l.flag}</p>
                      <p className="text-xs font-medium text-ink leading-tight">
                        {l.label}
                      </p>
                      {!l.available && (
                        <span className="absolute top-2 right-2 text-[9px] bg-ink/[0.06] text-ink-35 px-1.5 py-0.5 rounded-full font-mono">
                          em breve
                        </span>
                      )}
                      {active && (
                        <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-gold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Tema do Editor */}
            <SectionCard title="Tema do Editor de Código" icon={Terminal}>
              <p className="text-xs text-ink-35 mb-4">
                Syntax highlight no painel de código. Cada opção alinha o <strong className="text-ink/90">tema
                da interface</strong> (Claro, Escuro editorial, Monokai ou Dracula — cada um com estilo
                próprio).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CODE_THEMES.map((theme) => {
                  const active = prefs.codeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updatePref("codeTheme", theme.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? "border-gold/60 bg-gold/[0.06] text-ink"
                          : "border-ink-15 bg-ink/[0.02] text-ink-35 hover:text-ink hover:border-ink/20"
                      }`}
                    >
                      <div
                        className={`w-full h-8 rounded-lg ${theme.preview} border border-ink/10 flex items-center justify-center`}
                      >
                        <span className={`text-[10px] font-mono ${theme.accent}`}>
                          {"{ }"}
                        </span>
                      </div>
                      {theme.label}
                      {active && <Check className="w-3 h-3 text-gold" />}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Tipo de Projeto Padrão */}
            <SectionCard title="Tipo de Projeto Padrão" icon={Code2}>
              <p className="text-xs text-ink-35 mb-4">
                Pré-selecionado ao criar um novo projeto
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROJECT_TYPES.map((type) => {
                  const active = prefs.defaultProjectType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updatePref("defaultProjectType", type.id)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                        active
                          ? "border-gold/60 bg-gold/[0.06] text-ink font-medium"
                          : "border-ink-15 text-ink-35 hover:text-ink hover:border-ink/20 hover:bg-cream-2"
                      }`}
                    >
                      {type.label}
                      {active && (
                        <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Notificações */}
            <SectionCard title="Notificações" icon={Bell}>
              <p className="text-xs text-ink-35 mb-4">
                Os alertas de geração aparecem no painel quando o uso se aproxima do limite.
                Preferências de email são guardadas para comunicações futuras da plataforma.
              </p>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "emailNotifications" as const,
                      label: "Email de atualizações",
                      desc: "Novidades, dicas e releases do NeuroCode",
                    },
                    {
                      key: "generationAlerts" as const,
                      label: "Alertas de geração",
                      desc: "Aviso ao se aproximar do limite mensal",
                    },
                    {
                      key: "marketing" as const,
                      label: "Marketing",
                      desc: "Ofertas especiais e promoções",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-6"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="text-xs text-ink-35 mt-0.5">{item.desc}</p>
                    </div>
                    <ToggleSwitch
                      value={prefs[item.key]}
                      onChange={(v) => updatePref(item.key, v)}
                    />
                  </div>
                ))}

                {/* Segurança (sempre ativo) */}
                <div className="flex items-center justify-between gap-6 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                      Segurança
                      <span className="text-[10px] bg-ink/[0.06] text-ink-35 px-1.5 py-0.5 rounded-full font-mono">
                        sempre ativo
                      </span>
                    </p>
                    <p className="text-xs text-ink-35 mt-0.5">
                      Alertas de login e atividade suspeita
                    </p>
                  </div>
                  <ToggleSwitch value={true} onChange={() => {}} disabled />
                </div>
              </div>
            </SectionCard>

            {/* Salvar preferências */}
            <div className="flex justify-end pt-2">
              <button
                onClick={savePrefs}
                disabled={saving}
                className="bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/80 disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Salvar Preferências
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PRIVACIDADE ───────────────────────────────────────────────────── */}
        {activeTab === "privacy" && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-5"
          >
            {/* Exportar dados */}
            <SectionCard title="Exportar Seus Dados" icon={Download}>
              <p className="text-sm text-ink-35 leading-relaxed mb-4">
                Baixe uma cópia de todos os seus dados — perfil, projetos,
                preferências e histórico. Formato JSON (Art. 18 VI, LGPD).
              </p>
              <a href="/api/user/export" download="meus-dados-neurocode.json">
                <button className="border border-ink-15 text-ink-35 rounded-xl px-4 py-2 text-sm hover:bg-cream-2 hover:text-ink transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar meus dados (JSON)
                </button>
              </a>
            </SectionCard>

            {/* Zona de perigo */}
            <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Zona de Perigo
              </h2>
              <p className="text-sm text-ink-35 leading-relaxed mb-4">
                Remove permanentemente sua conta, todos os projetos e dados
                pessoais. Esta ação é{" "}
                <strong className="text-ink">irreversível</strong>.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirm("");
                }}
                className="border border-red-300 text-red-500 rounded-xl px-4 py-2 text-sm hover:bg-red-50 hover:border-red-400 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Conta Permanentemente
              </button>
            </div>

            {/* Links úteis */}
            <SectionCard title="Links Úteis" icon={Shield}>
              <div className="space-y-2.5">
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-ink-35 hover:text-ink transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Política de Privacidade
                </Link>
                <a
                  href="mailto:privacidade@neurocode.ai"
                  className="flex items-center gap-2 text-sm text-ink-35 hover:text-ink transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  privacidade@neurocode.ai — DPO
                </a>
              </div>
            </SectionCard>

            {/* Modal de exclusão */}
            <AnimatePresence>
              {showDeleteModal && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteModal(false)}
                  />
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 12 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-md rounded-2xl border border-ink-15 bg-cream p-6 shadow-2xl"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-ink">
                            Confirmar exclusão
                          </h3>
                          <p className="text-xs text-ink-35">
                            Esta ação não pode ser desfeita
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-ink-35 leading-relaxed mb-4">
                        Todos os seus projetos e dados serão removidos
                        permanentemente. Para confirmar, digite{" "}
                        <strong className="text-ink font-mono">EXCLUIR</strong>{" "}
                        abaixo.
                      </p>

                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="Digite EXCLUIR para confirmar"
                        className="w-full px-4 py-2.5 border border-ink-15 rounded-xl bg-cream text-ink text-sm focus:outline-none focus:border-red-400 mb-5 transition-colors"
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          disabled={deleting}
                          className="flex-1 border border-ink-15 text-ink-35 rounded-xl px-4 py-2 text-sm hover:bg-cream-2 hover:text-ink transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== "EXCLUIR" || deleting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Excluir permanentemente
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
