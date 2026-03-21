"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <motion.h1
            className="text-[120px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.h1>
          <motion.div
            className="absolute inset-0 blur-3xl opacity-20 bg-emerald-500 rounded-full"
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Página não encontrada
        </h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 hover:border-white/20"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Ir ao Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
