"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { RoadmapFeatureKey } from "@/lib/roadmap-data";

interface Props {
  featureKey: RoadmapFeatureKey;
  initialCount: number;
}

export function RoadmapVoteButton({ featureKey, initialCount }: Props) {
  const storageKey = `roadmap_vote_${featureKey}`;
  const [voted, setVoted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureKey }),
      });
      if (res.ok) {
        setVoted(true);
        setCount((c) => c + 1);
        localStorage.setItem(storageKey, "1");
      } else if (res.status === 401) {
        toast.error("Faça login para votar");
      }
    } catch {
      toast.error("Erro ao registrar voto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      className={`flex flex-col items-center gap-0.5 flex-shrink-0 transition-all ${
        voted
          ? "text-amber-400 cursor-default"
          : "text-white/30 hover:text-white/70 cursor-pointer"
      }`}
      title={voted ? "Já votou" : "Votar nessa funcionalidade"}
    >
      <ThumbsUp className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
      <span className="text-[10px] font-mono">{count > 0 ? count : ""}</span>
    </button>
  );
}
