import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useT } from "@/lib/patient-i18n";

export function PatientBack() {
  const { t } = useT();
  return (
    <Link to="/patient" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
      <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden="true" /> {t("back")}
    </Link>
  );
}
