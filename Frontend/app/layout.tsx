import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ScrollProgress } from "@/components/scroll-progress";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { GlobalProviders } from "@/components/global-providers";
import { LANG_COOKIE_NAME, cookieValueToHtmlLang } from "@/lib/locale-html";
import { getPublicAppUrl } from "@/lib/env";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-mono",
  display: "swap",
});

const APP_URL = getPublicAppUrl();

export const metadata: Metadata = {
  title: {
    default: "NeuroCode AI — Crie Software com Inteligência Artificial",
    template: "%s | NeuroCode AI",
  },
  description:
    "A plataforma revolucionária que transforma suas ideias em sistemas completos com apenas um clique. Crie sites, apps, SaaS e muito mais sem precisar programar.",
  keywords: ["inteligência artificial", "criação de software", "no-code", "geração de código", "IA", "programação"],
  authors: [{ name: "NeuroCode AI" }],
  creator: "NeuroCode AI",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "NeuroCode AI",
    title: "NeuroCode AI — Crie Software com Inteligência Artificial",
    description: "Transforme suas ideias em software completo com IA. Crie sites, apps e SaaS sem programar.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NeuroCode AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroCode AI — Crie Software com IA",
    description: "Transforme suas ideias em software completo com IA.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const langCookie = (await cookies()).get(LANG_COOKIE_NAME)?.value;
  const htmlLang = cookieValueToHtmlLang(langCookie);

  return (
    <ClerkProvider signUpFallbackRedirectUrl="/gerar">
      <html lang={htmlLang} suppressHydrationWarning className={`${cormorant.variable} ${syne.variable} ${dmMono.variable}`}>
        <body className="antialiased font-sans">
          <GlobalProviders>
            <ScrollProgress />
            {children}
            <CookieConsent />
            <Toaster
              position="bottom-right"
              closeButton
              duration={6000}
              toastOptions={{
                classNames: {
                  toast: "select-text cursor-text",
                  title: "select-text",
                  description: "select-text",
                },
                style: {
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-default)",
                  color: "var(--landing-text)",
                },
              }}
            />
          </GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
