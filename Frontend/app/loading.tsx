export default function Loading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-sm text-ink-60 animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}
