import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import { useT } from "@/lib/patient-i18n";
import { loadAppointments, tomorrowKey, type PatientAppointment } from "@/lib/patient-appointments";

// Shown when the app is opened the day before an appointment.
export function PatientAppointmentReminder() {
  const { t } = useT();
  const [due, setDue] = useState<PatientAppointment[] | null>(null);

  useEffect(() => {
    setDue(loadAppointments().filter((a) => a.date === tomorrowKey()));
  }, []);

  if (!due || due.length === 0) return null;

  return (
    <div role="note" className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-amber bg-secondary p-4 text-base font-semibold text-foreground">
      <BellRing className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden="true" />
      <span>
        {t("appt.reminder")}
        {due.map((a) => (
          <span key={a.id} className="block font-normal">
            {a.label.trim() || t("appt.default")}{a.time ? <span dir="ltr"> · {a.time}</span> : null}
          </span>
        ))}
      </span>
    </div>
  );
}
