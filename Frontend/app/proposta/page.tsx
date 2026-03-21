import type { Metadata } from "next";
import { Suspense } from "react";
import { PropostaBuilder } from "./proposta-builder";

export const metadata: Metadata = {
  title: "Proposta Comercial",
  description: "Modelo de proposta comercial pronta para vender o NeuroCode AI com maior ticket.",
};

export default function PropostaPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-surface text-white px-6 py-16">Carregando proposta...</main>}>
      <PropostaBuilder />
    </Suspense>
  );
}
