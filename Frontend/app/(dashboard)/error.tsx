"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Algo deu errado</h2>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Ocorreu um erro inesperado. Por favor, tente novamente ou volte ao
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            variant="outline"
            className="border-white/10 hover:border-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
            <Link href="/gerar">
              <Home className="w-4 h-4 mr-2" />
              Painel
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
