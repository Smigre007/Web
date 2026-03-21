import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();

  if (diff < 0) return "em breve";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes}min atrás`;
  return "agora";
}

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  website: "Site",
  webapp: "Aplicação Web",
  mobile: "App Mobile",
  saas: "SaaS",
  landing: "Landing Page",
  dashboard: "Dashboard",
  api: "API",
  automation: "Automação",
  platform: "Plataforma",
};

export const PROJECT_TYPE_ICONS: Record<string, string> = {
  website: "🌐",
  webapp: "⚡",
  mobile: "📱",
  saas: "🚀",
  landing: "🎯",
  dashboard: "📊",
  api: "🔌",
  automation: "🤖",
  platform: "🏗️",
};
