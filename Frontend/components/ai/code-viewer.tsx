"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileCode, Hash, WrapText } from "lucide-react";
import type { CodeFile } from "@/types";
import { CODE_THEME_EVENT } from "@/lib/neurocode-prefs-local";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
  dracula,
  okaidia,
} from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeTheme = "dark" | "light" | "monokai" | "dracula";

const THEME_MAP: Record<CodeTheme, object> = {
  dark: oneDark,
  light: oneLight,
  monokai: okaidia,
  dracula: dracula,
};

interface CodeViewerProps {
  files: CodeFile[];
}

const LANGUAGE_ALIASES: Record<string, string> = {
  tsx: "tsx",
  jsx: "jsx",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  css: "css",
  scss: "scss",
  html: "html",
  python: "python",
  py: "python",
  sql: "sql",
  json: "json",
  markdown: "markdown",
  md: "markdown",
  bash: "bash",
  sh: "bash",
  yaml: "yaml",
  yml: "yaml",
  rust: "rust",
  go: "go",
  java: "java",
  php: "php",
  ruby: "ruby",
  rb: "ruby",
};

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "text-blue-400",
  tsx: "text-cyan-400",
  javascript: "text-yellow-400",
  jsx: "text-cyan-400",
  css: "text-pink-400",
  scss: "text-pink-300",
  html: "text-orange-400",
  python: "text-amber-400",
  sql: "text-purple-400",
  json: "text-yellow-300",
  markdown: "text-white/60",
  bash: "text-white/50",
  yaml: "text-amber-400",
  rust: "text-orange-500",
  go: "text-blue-300",
  java: "text-red-400",
  php: "text-indigo-400",
  ruby: "text-red-300",
};

function normalizeLanguage(lang: string): string {
  const lower = lang.toLowerCase().trim();
  return LANGUAGE_ALIASES[lower] ?? lower;
}

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[normalizeLanguage(lang)] ?? "text-white/60";
}

function getFileIcon(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "⚛️";
  if (path.endsWith(".ts") || path.endsWith(".js")) return "📜";
  if (path.endsWith(".css") || path.endsWith(".scss")) return "🎨";
  if (path.endsWith(".html")) return "🌐";
  if (path.endsWith(".py")) return "🐍";
  if (path.endsWith(".sql")) return "🗄️";
  if (path.endsWith(".json")) return "📋";
  if (path.endsWith(".md")) return "📝";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "⚙️";
  if (path.endsWith(".sh") || path.endsWith(".bash")) return "💻";
  if (path.endsWith(".rs")) return "🦀";
  if (path.endsWith(".go")) return "🐹";
  return "📄";
}

function buildCodeStyle(base: object) {
  const b = base as Record<string, object>;
  return {
    ...b,
    'pre[class*="language-"]': {
      ...(b['pre[class*="language-"]'] ?? {}),
      background: "transparent",
      margin: 0,
      padding: 0,
      fontSize: "0.8rem",
      lineHeight: "1.7",
    },
    'code[class*="language-"]': {
      ...(b['code[class*="language-"]'] ?? {}),
      background: "transparent",
      fontSize: "0.8rem",
    },
  };
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.path ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [codeTheme, setCodeTheme] = useState<CodeTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("neurocode-code-theme") as CodeTheme | null;
    return saved && THEME_MAP[saved] ? saved : "dark";
  });

  useEffect(() => {
    const applyTheme = (raw: string | null | undefined) => {
      if (raw && THEME_MAP[raw as CodeTheme]) setCodeTheme(raw as CodeTheme);
    };
    // Outras tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "neurocode-code-theme") applyTheme(e.newValue);
    };
    // Mesma tab (Configurações, etc.)
    const customHandler = (e: Event) => {
      const d = (e as CustomEvent<string>).detail;
      applyTheme(d);
    };
    window.addEventListener("storage", storageHandler);
    window.addEventListener(CODE_THEME_EVENT, customHandler);
    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener(CODE_THEME_EVENT, customHandler);
    };
  }, []);

  const codeStyle = useMemo(() => buildCodeStyle(THEME_MAP[codeTheme]), [codeTheme]);

  const activeFileData = files.find((f) => f.path === activeFile);

  const copyCode = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const all = files
      .map((f) => `// ── ${f.path} ─────────────────────────────\n${f.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!files || files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-35">
        <div className="text-center">
          <FileCode className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Nenhum arquivo gerado ainda</p>
        </div>
      </div>
    );
  }

  const lang = normalizeLanguage(activeFileData?.language ?? "");

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#0d0118" }}>
      {/* File tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 bg-black/30 scrollbar-none">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => setActiveFile(file.path)}
            className={`flex items-center gap-2 px-4 py-3 text-xs whitespace-nowrap border-r border-white/10 transition-all ${
              activeFile === file.path
                ? "bg-amber-600/20 text-amber-300 border-b-2 border-b-amber-500"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{getFileIcon(file.path)}</span>
            <span className="font-mono">{file.path.split("/").pop()}</span>
          </button>
        ))}
      </div>

      {/* File info + toolbar */}
      {activeFileData && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-white/30 font-mono truncate">{activeFileData.path}</span>
            {activeFileData.language && (
              <span className={`text-xs font-medium flex-shrink-0 ${getLanguageColor(activeFileData.language)}`}>
                {activeFileData.language}
              </span>
            )}
            {activeFileData.description && (
              <span className="text-xs text-white/25 hidden md:block truncate">
                — {activeFileData.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Line numbers toggle */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              title={showLineNumbers ? "Ocultar números de linha" : "Mostrar números de linha"}
              className={`p-1.5 rounded-md transition-colors ${
                showLineNumbers ? "text-amber-400 bg-amber-500/15" : "text-white/30 hover:text-white/60"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
            </button>

            {/* Word wrap toggle */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              title={wordWrap ? "Desativar quebra de linha" : "Ativar quebra de linha"}
              className={`p-1.5 rounded-md transition-colors ${
                wordWrap ? "text-amber-400 bg-amber-500/15" : "text-white/30 hover:text-white/60"
              }`}
            >
              <WrapText className="w-3.5 h-3.5" />
            </button>

            {/* Copy current file */}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => copyCode(activeFileData.content, activeFileData.path)}
              title="Copiar arquivo"
            >
              {copied === activeFileData.path ? (
                <Check className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>

            {/* Copy all files */}
            {files.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1"
                onClick={copyAll}
                title="Copiar todos os arquivos"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedAll ? "Copiado!" : "Todos"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Code content with syntax highlighting */}
      <div
        className="overflow-auto max-h-[520px]"
        style={{ overflowWrap: wordWrap ? "break-word" : "normal" }}
      >
        {activeFileData && (
          <SyntaxHighlighter
            language={lang || "text"}
            style={codeStyle}
            showLineNumbers={showLineNumbers}
            lineNumberStyle={{
              color: "rgba(255,255,255,0.15)",
              fontSize: "0.75rem",
              paddingRight: "1.2em",
              userSelect: "none",
              minWidth: "2.5em",
            }}
            wrapLines={wordWrap}
            wrapLongLines={wordWrap}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "0.8rem",
              lineHeight: "1.7",
            }}
            codeTagProps={{
              style: { fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace" },
            }}
          >
            {activeFileData.content}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-2.5 flex items-center justify-between text-xs text-white/30">
        <span>
          {files.length} arquivo{files.length !== 1 ? "s" : ""}
          {activeFileData && (
            <> · {activeFileData.content.split("\n").length} linhas</>
          )}
        </span>
        <span className="font-mono">
          {activeFileData && getLanguageColor(activeFileData.language ?? "") !== "text-white/60"
            ? activeFileData.language
            : "texto"}
        </span>
      </div>
    </div>
  );
}
