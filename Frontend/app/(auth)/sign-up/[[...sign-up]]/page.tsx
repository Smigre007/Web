import { SignUp } from "@clerk/nextjs";
import { Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  DASHBOARD_GENERATE_HREF,
  safeInternalRedirectPath,
} from "@/lib/ia-routes";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}) {
  const sp = await searchParams;
  const customRedirect = safeInternalRedirectPath(sp.redirect_url);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 grid-pattern-editorial">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center">
              <Brain className="w-6 h-6 text-cream" />
            </div>
            <span className="font-black text-2xl text-ink">NeuroCode AI</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="text-ink-60 text-sm">
              Crie sua conta e ganhe 3 projetos grátis!
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <SignUp
            signInUrl="/sign-in"
            fallbackRedirectUrl={DASHBOARD_GENERATE_HREF}
            {...(customRedirect ? { forceRedirectUrl: customRedirect } : {})}
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
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
