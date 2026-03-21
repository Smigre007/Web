"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Wand2,
  MessageSquare,
  FolderCode,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

const STEPS = [
  {
    icon: Wand2,
    color: "from-amber-500 to-orange-600",
    title: "Descreva sua ideia",
    description:
      "Escreva em português o que você quer criar. Quanto mais detalhes, melhor! Tipo: 'Quero um site para minha clínica com agendamento online e galeria de fotos'.",
    tip: "💡 Sem conhecimento técnico necessário!",
  },
  {
    icon: Sparkles,
    color: "from-amber-500 to-amber-600",
    title: "A IA gera tudo",
    description:
      "O NeuroCode AI analisa sua ideia e cria código profissional completo — HTML, CSS, JavaScript, banco de dados, autenticação e muito mais.",
    tip: "⚡ Em menos de 60 segundos!",
  },
  {
    icon: MessageSquare,
    color: "from-indigo-500 to-blue-600",
    title: "Personalize com o Chat",
    description:
      "Use o Chat IA para refinar, melhorar ou modificar qualquer parte do projeto. Peça mudanças em linguagem natural.",
    tip: "🎨 Ajuste cores, textos, funcionalidades…",
  },
  {
    icon: FolderCode,
    color: "from-amber-500 to-orange-600",
    title: "Exporte e use",
    description:
      "Baixe o código completo ou use o preview ao vivo. O código é 100% seu — sem lock-in, sem assinatura obrigatória para exportar.",
    tip: "🚀 Código limpo e profissional!",
  },
];

const STEPS_I18N = {
  en: [
    { title: "Describe your idea", description: "Write what you want to build in plain language. The more details, the better.", tip: "No technical knowledge required!" },
    { title: "AI builds everything", description: "NeuroCode AI analyzes your idea and creates complete production-ready code.", tip: "In under 60 seconds!" },
    { title: "Customize with Chat", description: "Use AI Chat to refine or modify any part of the project using natural language.", tip: "Adjust colors, text and features." },
    { title: "Export and use", description: "Download full code or use live preview. The code is 100% yours.", tip: "Clean and professional code." },
  ],
  es: [
    { title: "Describe tu idea", description: "Escribe lo que quieres crear en lenguaje simple. Cuantos más detalles, mejor.", tip: "No necesitas conocimientos técnicos." },
    { title: "La IA crea todo", description: "NeuroCode AI analiza tu idea y genera código completo listo para producción.", tip: "En menos de 60 segundos." },
    { title: "Personaliza con Chat", description: "Usa el Chat IA para mejorar o modificar cualquier parte del proyecto.", tip: "Ajusta colores, textos y funciones." },
    { title: "Exporta y usa", description: "Descarga el código completo o usa la vista previa en vivo. El código es 100% tuyo.", tip: "Código limpio y profesional." },
  ],
  fr: [
    { title: "Décrivez votre idée", description: "Écrivez ce que vous voulez créer en langage simple. Plus de détails, meilleur résultat.", tip: "Aucune connaissance technique requise." },
    { title: "L'IA génère tout", description: "NeuroCode AI analyse votre idée et crée un code complet prêt pour la production.", tip: "En moins de 60 secondes." },
    { title: "Personnalisez avec le Chat", description: "Utilisez le Chat IA pour affiner ou modifier n'importe quelle partie du projet.", tip: "Ajustez couleurs, textes et fonctionnalités." },
    { title: "Exportez et utilisez", description: "Téléchargez le code complet ou utilisez l'aperçu en direct. Le code est 100% à vous.", tip: "Code propre et professionnel." },
  ],
} as const;

const STORAGE_KEY = "neurocode_onboarding_done";

export function OnboardingModal() {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const ui = {
    pt: { step: "Passo", of: "de", skip: "Pular", next: "Próximo", start: "Começar a criar!" },
    en: { step: "Step", of: "of", skip: "Skip", next: "Next", start: "Start building!" },
    es: { step: "Paso", of: "de", skip: "Saltar", next: "Siguiente", start: "Empezar a crear!" },
    fr: { step: "Étape", of: "de", skip: "Passer", next: "Suivant", start: "Commencer à créer !" },
  }[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so it doesn't flash immediately
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleDismiss();
    }
  };

  const localized = lang === "pt" ? STEPS : STEPS.map((s, idx) => ({ ...s, ...STEPS_I18N[lang][idx] }));
  const current = localized[step];
  const isLast = step === localized.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl border border-ink-15 overflow-hidden bg-cream"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-35 hover:text-ink-60 hover:bg-ink/[0.05] transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress dots */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {localized.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-6 bg-gold"
                        : i < step
                        ? "w-1.5 bg-gold/60"
                        : "w-1.5 bg-ink-15"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="px-8 pt-14 pb-8">
                {/* Icon */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-6 shadow-2xl`}
                    >
                      <current.icon className="w-9 h-9 text-white" />
                    </div>

                    {/* Step counter */}
                    <span className="text-xs text-ink-35 mb-2 font-medium tracking-wider uppercase">
                      {ui.step} {step + 1} {ui.of} {localized.length}
                    </span>

                    <h2 className="text-2xl font-black text-ink mb-3">
                      {current.title}
                    </h2>
                    <p className="text-ink-60 leading-relaxed text-sm mb-5">
                      {current.description}
                    </p>

                    {/* Tip */}
                    <div className="w-full px-4 py-3 rounded-xl bg-gold/10 border border-gold/20 text-sm text-gold">
                      {current.tip}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="text-sm text-ink-35 hover:text-ink-60 transition-colors"
                >
                  {ui.skip}
                </button>
                <Button
                  onClick={handleNext}
                  variant="glow"
                  className="flex-1"
                >
                  {isLast ? (
                    <>
                      <Check className="w-4 h-4" />
                      {ui.start}
                    </>
                  ) : (
                    <>
                      {ui.next}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
