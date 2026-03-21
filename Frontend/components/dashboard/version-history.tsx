"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

interface Version {
  id: string;
  version_number: number;
  prompt: string;
  created_at: string;
}

interface VersionHistoryProps {
  projectId: string;
  onRestored: () => void;
}

export function VersionHistory({ projectId, onRestored }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setVersions(data.versions ?? []);
    } catch {
      toast.error("Erro ao carregar histórico de versões");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async (versionId: string, versionNumber: number) => {
    setRestoringId(versionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore_version_id: versionId }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(`Versão v${versionNumber} restaurada com sucesso!`);
      onRestored();
      await fetchVersions();
    } catch {
      toast.error("Erro ao restaurar versão");
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <History className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm">Nenhuma versão salva ainda</p>
        <p className="text-xs mt-1 text-white/20">
          As versões são salvas automaticamente ao usar o chat de IA para refinar o projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-semibold text-white/70">
          {versions.length} versão{versions.length !== 1 ? "ões" : ""} salva{versions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {versions.map((version, index) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all group"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-400">v{version.version_number}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
              {version.prompt.length > 120
                ? version.prompt.slice(0, 120) + "…"
                : version.prompt}
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(version.created_at)}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestore(version.id, version.version_number)}
            disabled={restoringId !== null}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {restoringId === version.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5">Restaurar</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
