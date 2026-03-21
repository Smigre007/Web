"use client";

import type { ElementType } from "react";
import Link from "next/link";

export function DashboardKpiGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: string | number;
    sub?: string;
    icon: ElementType;
    /** When set, the whole card is a link (e.g. billing) */
    href?: string;
  }>;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs text-ink-35 font-mono uppercase tracking-wider leading-tight">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-ink/[0.04] shrink-0">
          <Icon className="w-4 h-4 text-ink-60" aria-hidden />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-ink tabular-nums">{value}</div>
      {sub ? (
        <div
          className={`text-[11px] sm:text-xs line-clamp-2 ${
            href ? "text-gold font-medium group-hover:underline" : "text-ink-35"
          }`}
        >
          {sub}
        </div>
      ) : null}
    </>
  );

  const className =
    "rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 bg-cream-2 border-ink-15 shadow-sm shadow-ink/[0.03] transition-colors " +
    (href ? "group hover:border-gold/35 hover:bg-cream cursor-pointer" : "");

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
