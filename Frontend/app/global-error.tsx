"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans bg-[var(--surface)] text-[var(--landing-text)] p-8">
        <h1 className="text-xl font-semibold mb-2">Algo correu mal</h1>
        <p className="text-sm opacity-90 mb-4">Desculpe o incómodo. Pode tentar novamente.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border border-[var(--border-default)] px-4 py-2 text-sm hover:bg-[var(--surface-elevated)]"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
