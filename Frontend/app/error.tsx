"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <motion.div
        className="text-center px-6 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">
          Algo deu errado
        </h1>
        <p className="text-white/40 mb-2 leading-relaxed">
          Um erro inesperado ocorreu. Nossa equipe foi notificada automaticamente.
        </p>
        {error.digest && (
          <p className="text-xs text-white/20 font-mono mb-8">
            ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 hover:border-white/20"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
