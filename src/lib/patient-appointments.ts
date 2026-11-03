// Patient appointments live only on this device's browser storage.
// Nothing is ever sent to a server or database.
export type PatientAppointment = { id: string; date: string; time: string; label: string };

const KEY = "medbridge-patient-appointments";

export function loadAppointments(): PatientAppointment[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as PatientAppointment[]) : [];
    return Array.isArray(list) ? list.filter((a) => a && typeof a.date === "string") : [];
  } catch {
    return [];
  }
}

export function saveAppointments(list: PatientAppointment[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

// Local day key, e.g. 2026-11-04. Device-local time, no timezone conversion.
export function dayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const tomorrowKey = () => dayKey(1);

// Builds a small .ics calendar file in the browser; nothing is uploaded.
export function buildIcs(appt: PatientAppointment, fallbackTitle: string): Blob {
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = (d: Date) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const start = new Date(`${appt.date}T${appt.time || "09:00"}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const title = (appt.label.trim() || fallbackTitle)
    .replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MedBridge//Patient appointments//EN",
    "BEGIN:VEVENT",
    `UID:${appt.id}@medbridge`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
}
