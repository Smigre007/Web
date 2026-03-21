"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-3 rounded-full bg-emerald-500/20" />
        </div>
        <p className="text-white/40 text-sm">Carregando...</p>
      </motion.div>
    </div>
  );
}
