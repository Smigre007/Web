"use client";

import { useMemo, useState } from "react";
import type { DashboardDict } from "@/components/dashboard/dashboard-copy";

type CalendarEvent = {
  time: string;
  title: string;
  sub: string;
  color: string;
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  { time: "09:00 – 10:00", title: "Standup da equipe", sub: "Sala virtual", color: "#b45309" },
  { time: "11:30 – 12:00", title: "Review de design", sub: "Design + Dev", color: "#7c3aed" },
  { time: "14:00 – 15:30", title: "Planning Sprint", sub: "Todos os devs", color: "#16a34a" },
  { time: "16:00 – 17:00", title: "Call com cliente", sub: "NeuroCode", color: "#d97706" },
];

const UPCOMING = [
  { date: "15 Mai", title: "Revisão de roadmap", type: "Reunião", color: "#7c3aed" },
  { date: "18 Mai", title: "Demo para investidores", type: "Apresentação", color: "#dc2626" },
  { date: "20 Mai", title: "Fim do Sprint", type: "Marco", color: "#16a34a" },
  { date: "22 Mai", title: "Workshop de UX", type: "Treinamento", color: "#d97706" },
  { date: "28 Mai", title: "All Hands Meeting", type: "Reunião", color: "#b45309" },
];

export function DashboardCalendarStrip({
  i,
  locale,
}: {
  i: DashboardDict;
  locale: string;
}) {
  const [activeDay, setActiveDay] = useState(3);

  const calDays = useMemo(() => {
    const today = new Date();
    const days: { d: Date; isToday: boolean; hasEvent: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - 3 + i);
      days.push({
        d,
        isToday: i === 3,
        hasEvent: [1, 3, 5].includes(i),
      });
    }
    return days;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink font-sans">{i.calendarTitle}</h2>
          <p className="text-sm text-ink-35 mt-0.5">{i.calendarSubtitle}</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-ink-15 bg-cream-2 px-4 py-2 text-sm font-medium text-ink hover:border-ink/[0.2] transition-colors shrink-0"
        >
          {i.calendarNewEvent}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 shadow-sm shadow-ink/[0.03]">
          <h3 className="text-sm font-semibold text-ink mb-4">{i.calendarThisWeek}</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {calDays.map((item, idx) => {
              const short = item.d.toLocaleDateString(locale, { weekday: "short" });
              const selected = activeDay === idx && !item.isToday;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveDay(idx)}
                  className={`min-w-[60px] shrink-0 rounded-xl border px-2 py-3 text-center transition-colors ${
                    item.isToday
                      ? "border-ink bg-ink text-cream"
                      : selected
                        ? "border-ink/25 bg-cream border-amber-900/15"
                        : "border-ink-15 bg-cream hover:border-ink/25"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-wide mb-1 ${
                      item.isToday ? "text-cream/80" : "text-ink-35"
                    }`}
                  >
                    {short}
                  </div>
                  <div className={`text-lg font-bold font-sans ${item.isToday ? "text-cream" : "text-ink"}`}>
                    {item.d.getDate()}
                  </div>
                  {item.hasEvent ? (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mx-auto mt-1.5 ${
                        item.isToday ? "bg-cream/80" : "bg-ink"
                      }`}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col gap-2.5">
            {DEFAULT_EVENTS.map((e, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5 border border-ink/10">
                <div className="w-1 h-9 rounded-full shrink-0" style={{ background: e.color }} />
                <div className="text-[11px] text-ink-35 w-[72px] shrink-0">{e.time}</div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-ink leading-tight">{e.title}</div>
                  <div className="text-[11px] text-ink-35">{e.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 shadow-sm shadow-ink/[0.03]">
          <h3 className="text-sm font-semibold text-ink mb-4">{i.calendarUpcoming}</h3>
          <div className="flex flex-col">
            {UPCOMING.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 py-3 border-b border-ink-15 last:border-0"
              >
                <div className="w-11 h-11 rounded-xl bg-cream flex flex-col items-center justify-center shrink-0 border border-ink-15">
                  <div className="text-[11px] font-bold text-ink leading-none" style={{ color: e.color }}>
                    {e.date.split(" ")[0]}
                  </div>
                  <div className="text-[9px] text-ink-35 uppercase mt-0.5">{e.date.split(" ")[1]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink">{e.title}</div>
                  <div className="text-[11px] text-ink-35">{e.type}</div>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
