import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Download, List, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { PatientAppointmentReminder } from "@/components/patient-appointment-reminder";
import { useT } from "@/lib/patient-i18n";
import { buildIcs, dayKey, loadAppointments, saveAppointments, type PatientAppointment } from "@/lib/patient-appointments";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [
      { title: "My appointments — MedBridge" },
      { name: "description", content: "Keep your appointments on this phone, with a calendar file for each one. Nothing is saved on a server." },
      { property: "og:title", content: "My appointments — MedBridge" },
      { property: "og:description", content: "Keep your appointments on this phone, with a calendar file for each one. Nothing is saved on a server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Appointments,
});

const LOCALES: Record<string, string> = { fr: "fr-CH", en: "en-CH", ar: "ar", ti: "ti", prs: "fa", ps: "ps", so: "so", tr: "tr-TR", uk: "uk-UA" };

function Appointments() {
  const { t, lang } = useT();
  // Appointments are read from this device only, after hydration.
  const [list, setList] = useState<PatientAppointment[] | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [label, setLabel] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setList(loadAppointments().slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)));
    const d = new Date();
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  }, []);

  function add() {
    if (!date) return;
    const appt: PatientAppointment = { id: crypto.randomUUID(), date, time, label: label.trim().slice(0, 60) };
    const next = [...(list ?? []), appt].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    saveAppointments(next);
    setList(next);
    setDate(""); setTime(""); setLabel("");
  }

  // The .ics file is built in the browser from device-only data.
  function downloadIcs(appt: PatientAppointment) {
    const url = URL.createObjectURL(buildIcs(appt, t("appt.default")));
    const a = document.createElement("a");
    a.href = url;
    a.download = "medbridge-appointment.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  function formatDate(appt: PatientAppointment) {
    try {
      return new Date(`${appt.date}T${appt.time || "09:00"}`).toLocaleDateString(LOCALES[lang] ?? undefined, { weekday: "long", day: "numeric", month: "long" });
    } catch {
      return appt.date;
    }
  }

  const todayKey = dayKey();

  function renderAppt(appt: PatientAppointment) {
    return (
      <article key={appt.id} className="card p-6">
        <p className="text-xl font-semibold text-foreground">{appt.label.trim() || t("appt.default")}</p>
        <p className="mt-1 text-lg text-muted-foreground">{formatDate(appt)}{appt.time ? <span dir="ltr"> · {appt.time}</span> : null}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => downloadIcs(appt)} className="btn-primary inline-flex min-h-12 items-center gap-2 px-5 text-base font-semibold">
            <Download className="size-5" aria-hidden="true" /> {t("appt.calendar")}
          </button>
          <Link to="/patient/prepare" className="btn-secondary inline-flex min-h-12 items-center gap-2 px-5 text-base font-semibold">
            <ListChecks className="size-5" aria-hidden="true" /> {t("topic.prepare")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t("appt.title")}</h1>
      <p role="note" className="mt-4 flex items-start gap-3 rounded-2xl bg-accent p-4 text-base font-medium text-accent-foreground">
        {t("appt.notice")}
      </p>

      <PatientAppointmentReminder />

      <section className="card mt-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("appt.add")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm font-medium text-muted-foreground">{t("appt.date")}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border bg-background p-3 text-lg text-foreground" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-muted-foreground">{t("appt.time")}</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border bg-background p-3 text-lg text-foreground" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="block text-sm font-medium text-muted-foreground">{t("appt.label")}</span>
          <input type="text" value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder={t("appt.labelPlaceholder")}
            className="mt-1 w-full rounded-2xl border border-border bg-background p-3 text-lg text-foreground placeholder:text-muted-foreground" />
        </label>
        <button type="button" onClick={add} disabled={!date}
          className="btn-primary mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50">
          <CalendarPlus className="size-5" aria-hidden="true" /> {t("appt.add")}
        </button>
      </section>

      <div role="tablist" className="mt-5 grid grid-cols-2 gap-2 rounded-full border border-border bg-card p-1">
        {(["list", "calendar"] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-base font-semibold ${view === v ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
            {v === "list" ? <List className="size-5" aria-hidden="true" /> : <CalendarDays className="size-5" aria-hidden="true" />}
            {v === "list" ? t("appt.viewList") : t("appt.viewCalendar")}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <section className="mt-5 space-y-4">
          {list === null ? null : list.length === 0 ? (
            <p className="text-lg text-muted-foreground">{t("appt.empty")}</p>
          ) : list.map(renderAppt)}
        </section>
      ) : month && (
        <section className="mt-5 space-y-4">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <button type="button" aria-label={t("appt.prevMonth")} onClick={() => setMonth({ y: month.m === 0 ? month.y - 1 : month.y, m: month.m === 0 ? 11 : month.m - 1 })}
                className="btn-secondary inline-flex size-12 items-center justify-center">
                <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
              </button>
              <h2 className="text-xl font-semibold capitalize text-foreground">
                {new Date(month.y, month.m, 1).toLocaleDateString(LOCALES[lang] ?? undefined, { month: "long", year: "numeric" })}
              </h2>
              <button type="button" aria-label={t("appt.nextMonth")} onClick={() => setMonth({ y: month.m === 11 ? month.y + 1 : month.y, m: month.m === 11 ? 0 : month.m + 1 })}
                className="btn-secondary inline-flex size-12 items-center justify-center">
                <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i}>{new Date(2024, 0, 1 + i).toLocaleDateString(LOCALES[lang] ?? undefined, { weekday: "narrow" })}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthCells(month.y, month.m).map((key, i) => {
                if (!key) return <span key={i} />;
                const has = (list ?? []).some((a) => a.date === key);
                const isSel = selected === key;
                return (
                  <button key={key} type="button" onClick={() => setSelected(key)} aria-pressed={isSel}
                    className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl text-base font-semibold ${isSel ? "bg-primary text-primary-foreground" : key === todayKey ? "bg-accent text-accent-foreground" : "text-foreground"}`}>
                    {Number(key.slice(8))}
                    {has && <span aria-hidden="true" className={`absolute bottom-1.5 size-1.5 rounded-full ${isSel ? "bg-primary-foreground" : "bg-primary"}`} />}
                  </button>
                );
              })}
            </div>
          </div>
          {selected && (() => {
            const day = (list ?? []).filter((a) => a.date === selected);
            return day.length === 0
              ? <p className="text-lg text-muted-foreground">{t("appt.noneThisDay")}</p>
              : day.map(renderAppt);
          })()}
        </section>
      )}
    </div>
  );
}

// Monday-first month grid of local day keys; null for leading blanks.
function monthCells(y: number, m: number): (string | null)[] {
  const p = (n: number) => String(n).padStart(2, "0");
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${y}-${p(m + 1)}-${p(i + 1)}`)];
}
