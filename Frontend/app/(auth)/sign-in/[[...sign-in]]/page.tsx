import { SignIn } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 grid-pattern-editorial">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center">
              <Brain className="w-6 h-6 text-cream" />
            </div>
            <span className="font-black text-2xl text-ink">NeuroCode AI</span>
          </Link>
          <p className="text-ink-60 mt-2 text-sm">
            Bem-vindo de volta! Faça login para criar software com IA.
          </p>
        </div>

        {/* Clerk SignIn component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              variables: {
                colorBackground: "#f5f2ed",
                colorText: "#141210",
                colorInputBackground: "rgba(20,18,16,0.04)",
                colorInputText: "#141210",
                colorPrimary: "#b91c1c",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-cream-2/80 border border-ink-15 shadow-lg shadow-ink/[0.06] backdrop-blur-sm rounded-2xl",
                headerTitle: "text-ink font-bold",
                headerSubtitle: "text-ink-60",
                socialButtonsBlockButton:
                  "border border-ink-15 bg-ink/[0.03] text-ink hover:bg-ink/[0.07] rounded-xl",
                socialButtonsBlockButtonText: "text-ink",
                dividerLine: "bg-ink-15",
                dividerText: "text-ink-35",
                formFieldLabel: "text-ink-60",
                formFieldInput:
                  "bg-ink/[0.04] border border-ink-15 text-ink rounded-xl focus:ring-[#b91c1c] focus:border-[#b91c1c]",
                formButtonPrimary:
                  "bg-ink hover:bg-gold rounded-xl font-semibold",
                footerActionText: "text-ink-35",
                footerActionLink: "text-gold hover:text-gold-lt",
                identityPreviewEditButton: "text-gold",
                formFieldInputShowPasswordButton: "text-ink-35",
                alertText: "text-ink-60",
                alertIcon: "text-[#b91c1c]",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
