import { isLanguageCode, type LanguageCode } from "@/lib/locale-html";

export type ChangeType = "feature" | "improvement" | "fix" | "security";

export interface ChangelogChange {
  type: ChangeType;
  title: string;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangelogChange[];
}

export interface ChangelogUiStrings {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  subtitle: string;
  latest: string;
  typeLabels: Record<ChangeType, string>;
  footerBefore: string;
  footerLink: string;
  footerAfter: string;
}

/** Apenas classes Tailwind — labels vêm de `ChangelogUiStrings.typeLabels`. */
export const CHANGELOG_TYPE_CLASS: Record<ChangeType, string> = {
  feature: "bg-gold/[0.12] text-gold border-gold/25",
  improvement: "bg-ink/[0.06] text-ink-60 border-ink-15",
  fix: "bg-gold/[0.08] text-gold border-gold/20",
  security: "bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/20",
};

export const CHANGELOG_UI: Record<LanguageCode, ChangelogUiStrings> = {
  pt: {
    metaTitle: "Changelog — NeuroCode AI",
    metaDescription: "Acompanhe as últimas atualizações, melhorias e novidades do NeuroCode AI.",
    badge: "Atualizações do produto",
    title: "Changelog",
    subtitle: "Cada semana o NeuroCode AI fica melhor. Aqui você acompanha cada melhoria.",
    latest: "Mais recente",
    typeLabels: {
      feature: "Nova funcionalidade",
      improvement: "Melhoria",
      fix: "Correção",
      security: "Segurança",
    },
    footerBefore: "Tem uma sugestão? Acesse o",
    footerLink: "roadmap público",
    footerAfter: "e vote nas próximas funcionalidades.",
  },
  en: {
    metaTitle: "Changelog — NeuroCode AI",
    metaDescription: "Follow the latest updates, improvements, and news from NeuroCode AI.",
    badge: "Product updates",
    title: "Changelog",
    subtitle: "NeuroCode AI gets better every week. Here you can follow every improvement.",
    latest: "Latest",
    typeLabels: {
      feature: "New feature",
      improvement: "Improvement",
      fix: "Fix",
      security: "Security",
    },
    footerBefore: "Have a suggestion? Visit the",
    footerLink: "public roadmap",
    footerAfter: "and vote on upcoming features.",
  },
  es: {
    metaTitle: "Changelog — NeuroCode AI",
    metaDescription: "Sigue las últimas actualizaciones, mejoras y novedades de NeuroCode AI.",
    badge: "Actualizaciones del producto",
    title: "Changelog",
    subtitle: "Cada semana NeuroCode AI mejora. Aquí puedes seguir cada cambio.",
    latest: "Más reciente",
    typeLabels: {
      feature: "Nueva función",
      improvement: "Mejora",
      fix: "Corrección",
      security: "Seguridad",
    },
    footerBefore: "¿Tienes una sugerencia? Visita el",
    footerLink: "roadmap público",
    footerAfter: "y vota las próximas funcionalidades.",
  },
  fr: {
    metaTitle: "Changelog — NeuroCode AI",
    metaDescription: "Suivez les dernières mises à jour, améliorations et nouveautés de NeuroCode AI.",
    badge: "Mises à jour produit",
    title: "Changelog",
    subtitle: "Chaque semaine NeuroCode AI s’améliore. Suivez chaque évolution ici.",
    latest: "Plus récent",
    typeLabels: {
      feature: "Nouvelle fonctionnalité",
      improvement: "Amélioration",
      fix: "Correction",
      security: "Sécurité",
    },
    footerBefore: "Une suggestion ? Consultez la",
    footerLink: "feuille de route publique",
    footerAfter: "et votez pour les prochaines fonctionnalités.",
  },
};

const ENTRIES_PT: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "17 mar 2026",
    changes: [
      {
        type: "feature",
        title: "GitHub Integration",
        description:
          "Envie seus projetos gerados diretamente para repositórios no GitHub com um clique. Requer plano Starter ou superior.",
      },
      {
        type: "feature",
        title: "Histórico de Versões",
        description:
          "Cada regeneração agora salva automaticamente uma versão anterior. Restaure qualquer versão com um clique. Free: 1 versão, Starter: 5, Pro: ilimitado.",
      },
      {
        type: "feature",
        title: "Programa de Indicações",
        description: "Indique amigos e ganhe 20% de comissão em cada assinatura convertida. Saques via Pix mensalmente.",
      },
      {
        type: "improvement",
        title: "Hero com Demo Interativa",
        description:
          "A landing page agora exibe uma demonstração ao vivo do NeuroCode AI funcionando — prompt digitando em tempo real, código sendo gerado e preview ao vivo.",
      },
      {
        type: "improvement",
        title: "Preview Real no Demo",
        description:
          "A aba Preview da demonstração agora renderiza um site real gerado por IA dentro de um iframe — não mais um mockup estático com emojis.",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "3 mar 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI Engine v2",
        description:
          "Nova versão do motor de IA proprietário do NeuroCode. Código gerado com melhor qualidade, arquitetura mais robusta e comentários mais detalhados.",
      },
      {
        type: "improvement",
        title: "Streaming mais rápido",
        description: "A geração de código agora tem latência 40% menor. O primeiro token aparece em menos de 2 segundos.",
      },
      {
        type: "fix",
        title: "Exportação ZIP",
        description: "Corrigido bug onde arquivos com caracteres especiais no nome quebravam o ZIP gerado.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "18 fev 2026",
    changes: [
      {
        type: "feature",
        title: "9 tipos de projeto",
        description:
          "Adicionados novos tipos: API, Automação e Plataforma. Cada tipo tem prompts otimizados para gerar código mais relevante.",
      },
      {
        type: "feature",
        title: "Command Palette",
        description: "Pressione ⌘K para acessar qualquer funcionalidade do dashboard rapidamente.",
      },
      {
        type: "improvement",
        title: "Dashboard redesenhado",
        description:
          "Interface do dashboard completamente repaginada com melhor organização de projetos e acesso rápido às ações principais.",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "5 fev 2026",
    changes: [
      {
        type: "feature",
        title: "Chat de refinamento",
        description:
          "Após gerar um projeto, use o chat de IA para pedir modificações em linguagem natural. 'Muda a cor para azul' ou 'Adiciona autenticação' — a IA entende.",
      },
      {
        type: "security",
        title: "Verificação de webhook reforçada",
        description:
          "Todos os webhooks do Stripe e Clerk agora usam HMAC-SHA256 com validação de timestamp para prevenir replay attacks.",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "22 jan 2026",
    changes: [
      {
        type: "feature",
        title: "Plano Enterprise",
        description: "Lançamento do plano Enterprise com gerações ilimitadas, white-label e SLA garantido de 99.9%.",
      },
      {
        type: "improvement",
        title: "Limites mensais automáticos",
        description:
          "Cron job reseta automaticamente o contador de gerações no primeiro dia de cada mês para todos os usuários.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "10 jan 2026",
    changes: [
      {
        type: "feature",
        title: "Lançamento do NeuroCode AI 2.0",
        description:
          "Plataforma completamente reescrita com Next.js 16, React 19 e Tailwind 4. Interface editorial premium, animações fluidas e arquitetura serverless.",
      },
      {
        type: "feature",
        title: "Preview em tempo real",
        description:
          "Veja seu projeto sendo renderizado em um iframe ao lado do código sendo gerado. Nenhuma ferramenta no mercado faz isso.",
      },
    ],
  },
];

const ENTRIES_EN: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "Mar 17, 2026",
    changes: [
      {
        type: "feature",
        title: "GitHub integration",
        description:
          "Push generated projects straight to GitHub repositories in one click. Requires Starter plan or higher.",
      },
      {
        type: "feature",
        title: "Version history",
        description:
          "Each regeneration now saves a previous version automatically. Restore any version in one click. Free: 1 version, Starter: 5, Pro: unlimited.",
      },
      {
        type: "feature",
        title: "Referral program",
        description: "Refer friends and earn 20% commission on each converted subscription. Monthly payouts via Pix.",
      },
      {
        type: "improvement",
        title: "Interactive demo hero",
        description:
          "The landing page now shows a live demo of NeuroCode AI — prompt typing in real time, code streaming, and live preview.",
      },
      {
        type: "improvement",
        title: "Real preview in demo",
        description:
          "The demo’s Preview tab now renders a real AI-generated site in an iframe — no more static emoji mockups.",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "Mar 3, 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI Engine v2",
        description:
          "New version of NeuroCode’s proprietary AI engine. Better code quality, stronger architecture, and richer comments.",
      },
      {
        type: "improvement",
        title: "Faster streaming",
        description: "Code generation has ~40% lower latency. First token in under 2 seconds.",
      },
      {
        type: "fix",
        title: "ZIP export",
        description: "Fixed a bug where filenames with special characters could break the generated ZIP.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "Feb 18, 2026",
    changes: [
      {
        type: "feature",
        title: "9 project types",
        description:
          "New types: API, Automation, and Platform. Each type has tuned prompts for more relevant code.",
      },
      {
        type: "feature",
        title: "Command palette",
        description: "Press ⌘K to jump to any dashboard action quickly.",
      },
      {
        type: "improvement",
        title: "Redesigned dashboard",
        description: "Dashboard UI reworked with clearer project organization and faster access to key actions.",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "Feb 5, 2026",
    changes: [
      {
        type: "feature",
        title: "Refinement chat",
        description:
          "After generating a project, use AI chat to request changes in plain language — “make it blue” or “add authentication”.",
      },
      {
        type: "security",
        title: "Stricter webhook verification",
        description:
          "Stripe and Clerk webhooks now use HMAC-SHA256 with timestamp validation to reduce replay risk.",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "Jan 22, 2026",
    changes: [
      {
        type: "feature",
        title: "Enterprise plan",
        description: "Enterprise plan with unlimited generations, white-label options, and a 99.9% uptime SLA.",
      },
      {
        type: "improvement",
        title: "Automatic monthly limits",
        description: "A cron job resets generation counters on the first day of each month for all users.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "Jan 10, 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI 2.0 launch",
        description:
          "Platform rebuilt on Next.js 16, React 19, and Tailwind 4 — premium editorial UI, smooth motion, serverless architecture.",
      },
      {
        type: "feature",
        title: "Real-time preview",
        description: "Watch your project render in an iframe beside the streaming code — a rare end-to-end experience.",
      },
    ],
  },
];

const ENTRIES_ES: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "17 mar 2026",
    changes: [
      {
        type: "feature",
        title: "Integración con GitHub",
        description:
          "Envía tus proyectos generados directamente a repositorios de GitHub con un clic. Requiere plan Starter o superior.",
      },
      {
        type: "feature",
        title: "Historial de versiones",
        description:
          "Cada regeneración guarda automáticamente una versión anterior. Restaura cualquier versión con un clic. Free: 1, Starter: 5, Pro: ilimitadas.",
      },
      {
        type: "feature",
        title: "Programa de referidos",
        description: "Invita amigos y gana un 20 % de comisión por suscripción convertida. Pagos mensuales por Pix.",
      },
      {
        type: "improvement",
        title: "Hero con demo interactiva",
        description:
          "La landing muestra una demo en vivo de NeuroCode AI: prompt en tiempo real, código generándose y vista previa.",
      },
      {
        type: "improvement",
        title: "Vista previa real en la demo",
        description:
          "La pestaña Preview muestra un sitio real generado por IA en un iframe, ya no un mock estático con emojis.",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "3 mar 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI Engine v2",
        description:
          "Nueva versión del motor de IA propietario: mejor calidad de código, arquitectura más sólida y comentarios más detallados.",
      },
      {
        type: "improvement",
        title: "Streaming más rápido",
        description: "La generación tiene ~40 % menos latencia. El primer token en menos de 2 segundos.",
      },
      {
        type: "fix",
        title: "Exportación ZIP",
        description: "Corregido un error donde nombres con caracteres especiales rompían el ZIP generado.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "18 feb 2026",
    changes: [
      {
        type: "feature",
        title: "9 tipos de proyecto",
        description:
          "Nuevos tipos: API, Automatización y Plataforma. Cada uno con prompts optimizados para código más relevante.",
      },
      {
        type: "feature",
        title: "Paleta de comandos",
        description: "Pulsa ⌘K para acceder rápido a cualquier acción del panel.",
      },
      {
        type: "improvement",
        title: "Panel rediseñado",
        description: "Interfaz renovada con mejor organización de proyectos y acceso rápido a las acciones principales.",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "5 feb 2026",
    changes: [
      {
        type: "feature",
        title: "Chat de refinamiento",
        description:
          "Tras generar un proyecto, pide cambios en lenguaje natural: “cambia el color a azul” o “añade autenticación”.",
      },
      {
        type: "security",
        title: "Verificación de webhooks reforzada",
        description:
          "Los webhooks de Stripe y Clerk usan HMAC-SHA256 con validación de tiempo para reducir ataques de repetición.",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "22 ene 2026",
    changes: [
      {
        type: "feature",
        title: "Plan Enterprise",
        description: "Plan Enterprise con generaciones ilimitadas, white-label y SLA del 99,9 %.",
      },
      {
        type: "improvement",
        title: "Límites mensuales automáticos",
        description: "Un cron reinicia el contador de generaciones el primer día de cada mes para todos los usuarios.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "10 ene 2026",
    changes: [
      {
        type: "feature",
        title: "Lanzamiento de NeuroCode AI 2.0",
        description:
          "Plataforma reescrita con Next.js 16, React 19 y Tailwind 4. UI editorial, animaciones fluidas y arquitectura serverless.",
      },
      {
        type: "feature",
        title: "Vista previa en tiempo real",
        description: "Ve tu proyecto renderizado en un iframe junto al código generado. Una experiencia poco común en el mercado.",
      },
    ],
  },
];

const ENTRIES_FR: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "17 mars 2026",
    changes: [
      {
        type: "feature",
        title: "Intégration GitHub",
        description:
          "Poussez vos projets générés vers des dépôts GitHub en un clic. Nécessite le plan Starter ou supérieur.",
      },
      {
        type: "feature",
        title: "Historique des versions",
        description:
          "Chaque régénération enregistre une version précédente. Restaurez n’importe quelle version en un clic. Free : 1, Starter : 5, Pro : illimité.",
      },
      {
        type: "feature",
        title: "Programme de parrainage",
        description:
          "Parrainez des amis et gagnez 20 % de commission sur chaque abonnement converti. Versements mensuels via Pix.",
      },
      {
        type: "improvement",
        title: "Hero avec démo interactive",
        description:
          "La page d’accueil montre une démo live : saisie du prompt, génération du code et aperçu en temps réel.",
      },
      {
        type: "improvement",
        title: "Aperçu réel dans la démo",
        description:
          "L’onglet Preview affiche un site réel généré par l’IA dans une iframe — fini la maquette statique avec emojis.",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "3 mars 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI Engine v2",
        description:
          "Nouvelle version du moteur IA propriétaire : code de meilleure qualité, architecture plus robuste, commentaires enrichis.",
      },
      {
        type: "improvement",
        title: "Streaming plus rapide",
        description: "Latence ~40 % plus faible. Premier jeton en moins de 2 secondes.",
      },
      {
        type: "fix",
        title: "Export ZIP",
        description:
          "Correction d’un bug où des noms de fichiers avec caractères spéciaux cassaient l’archive ZIP.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "18 févr. 2026",
    changes: [
      {
        type: "feature",
        title: "9 types de projets",
        description:
          "Nouveaux types : API, Automatisation et Plateforme. Prompts optimisés pour un code plus pertinent.",
      },
      {
        type: "feature",
        title: "Palette de commandes",
        description: "⌘K pour accéder rapidement aux actions du tableau de bord.",
      },
      {
        type: "improvement",
        title: "Tableau de bord repensé",
        description:
          "Interface retravaillée : meilleure organisation des projets et accès rapide aux actions principales.",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "5 févr. 2026",
    changes: [
      {
        type: "feature",
        title: "Chat d’affinage",
        description:
          "Après génération, demandez des modifications en langage naturel — « passe le fond en bleu » ou « ajoute l’authentification ».",
      },
      {
        type: "security",
        title: "Vérification webhooks renforcée",
        description:
          "Les webhooks Stripe et Clerk utilisent HMAC-SHA256 avec horodatage pour limiter les attaques par rejeu.",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "22 janv. 2026",
    changes: [
      {
        type: "feature",
        title: "Offre Enterprise",
        description:
          "Plan Enterprise : générations illimitées, white-label et SLA 99,9 %.",
      },
      {
        type: "improvement",
        title: "Limites mensuelles automatiques",
        description:
          "Un cron réinitialise les compteurs de génération le premier jour de chaque mois pour tous les utilisateurs.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "10 janv. 2026",
    changes: [
      {
        type: "feature",
        title: "Lancement NeuroCode AI 2.0",
        description:
          "Plateforme réécrite avec Next.js 16, React 19 et Tailwind 4 — UI éditoriale, animations fluides, architecture serverless.",
      },
      {
        type: "feature",
        title: "Aperçu en temps réel",
        description:
          "Voyez le projet rendu dans une iframe à côté du code généré — une expérience rare sur le marché.",
      },
    ],
  },
];

export const CHANGELOG_ENTRIES: Record<LanguageCode, ChangelogEntry[]> = {
  pt: ENTRIES_PT,
  en: ENTRIES_EN,
  es: ENTRIES_ES,
  fr: ENTRIES_FR,
};

export function getChangelogForLanguage(lang: LanguageCode | string | undefined): {
  ui: ChangelogUiStrings;
  entries: ChangelogEntry[];
} {
  const code = isLanguageCode(lang) ? lang : "pt";
  return {
    ui: CHANGELOG_UI[code],
    entries: CHANGELOG_ENTRIES[code],
  };
}
