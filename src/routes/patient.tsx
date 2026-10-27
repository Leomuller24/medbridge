import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Globe, Phone, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { PatientLangContext } from "@/lib/patient-i18n";
import { LANGUAGE_INFO, PATIENT_LANGS, isPatientLang, translate, type PatientLang } from "@/lib/patient-translations";
import { clearStoredRole, setStoredRole } from "@/lib/role";

export const Route = createFileRoute("/patient")({
  component: PatientLayout,
});

const LANG_KEY = "medbridge-patient-lang";

function PatientLayout() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<PatientLang>("en");
  useEffect(() => {
    setStoredRole("patient");
    const saved = window.localStorage.getItem(LANG_KEY);
    if (isPatientLang(saved)) setLang(saved);
  }, []);
  function choose(l: PatientLang) {
    setLang(l);
    window.localStorage.setItem(LANG_KEY, l);
  }
  const t = (k: Parameters<typeof translate>[0]) => translate(k, lang);
  const dir = LANGUAGE_INFO[lang].dir;
  return (
    <PatientLangContext.Provider value={lang}>
      <div className="bg-soft flex min-h-screen flex-col text-start" lang={lang} dir={dir}>
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5 py-5">
          <Link to="/patient" aria-label="Patient home" className="shrink-0"><Logo /></Link>
          <div className="flex min-w-0 items-center gap-1">
            <label className="relative flex items-center">
              <span className="sr-only">{t("language")}</span>
              <Globe className="pointer-events-none absolute start-3 size-4 text-muted-foreground" aria-hidden="true" />
              <select
                value={lang}
                onChange={(e) => isPatientLang(e.target.value) && choose(e.target.value)}
                className="min-h-10 max-w-[9.5rem] appearance-none rounded-full border border-border bg-card ps-9 pe-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PATIENT_LANGS.map((l) => (
                  <option key={l} value={l} lang={l} dir={LANGUAGE_INFO[l].dir}>{LANGUAGE_INFO[l].name}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => { clearStoredRole(); navigate({ to: "/choose-role" }); }}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Repeat className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">{t("switchRole")}</span><span className="sr-only sm:hidden">{t("switchRole")}</span>
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-8">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-3xl px-5 pb-8">
          <div role="alert" className="flex items-center gap-3 rounded-[20px] border-2 border-destructive bg-destructive/10 p-5 text-lg font-semibold text-destructive">
            <Phone className="size-6 shrink-0" aria-hidden="true" /> {t("emergency")}
          </div>
          <p className="mt-4 text-center text-sm font-medium text-foreground">{t("general")}</p>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t("noData")}</p>
          {lang !== "en" && <p className="mt-2 text-center text-xs text-muted-foreground">{t("notChecked")}</p>}
        </footer>
      </div>
    </PatientLangContext.Provider>
  );
}
