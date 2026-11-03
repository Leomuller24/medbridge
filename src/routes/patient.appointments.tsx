import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarPlus, Download, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { PatientAppointmentReminder } from "@/components/patient-appointment-reminder";
import { useT } from "@/lib/patient-i18n";
import { buildIcs, loadAppointments, saveAppointments, type PatientAppointment } from "@/lib/patient-appointments";

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

  useEffect(() => {
    setList(loadAppointments().slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)));
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

      <section className="mt-5 space-y-4">
        {list === null ? null : list.length === 0 ? (
          <p className="text-lg text-muted-foreground">{t("appt.empty")}</p>
        ) : (
          list.map((appt) => (
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
          ))
        )}
      </section>
    </div>
  );
}
