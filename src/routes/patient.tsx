import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Phone, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { PATIENT_TEXT, PatientLangContext, type PatientLang } from "@/lib/patient-i18n";
import { clearStoredRole, setStoredRole } from "@/lib/role";
import { cn } from "@/lib/utils";
import { EXTRA_LANGUAGES, type ExtraLang } from "@/lib/symptom-translations";

const LANGS: { code: PatientLang; name: string }[] = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  ...(Object.keys(EXTRA_LANGUAGES) as ExtraLang[]).map((code) => ({ code, name: EXTRA_LANGUAGES[code].name })),
];

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
    if (saved && LANGS.some((l) => l.code === saved)) setLang(saved as PatientLang);
  }, []);
  function choose(l: PatientLang) {
    setLang(l);
    window.localStorage.setItem(LANG_KEY, l);
  }
  const t = PATIENT_TEXT[lang];
  return (
    <PatientLangContext.Provider value={lang}>
      <div className="bg-soft flex min-h-screen flex-col" lang={lang === "fr" ? "fr" : "en"}>
        <header className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-5">
          <Link to="/patient" aria-label="Patient home"><Logo /></Link>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-[20px] border border-border bg-card p-1" role="group" aria-label="Language">
              {LANGS.map(({ code: l, name }) => (
                <button
                  key={l}
                  type="button"
                  lang={l}
                  dir={l in EXTRA_LANGUAGES ? EXTRA_LANGUAGES[l as ExtraLang].dir : "ltr"}
                  onClick={() => choose(l)}
                  aria-pressed={lang === l}
                  className={cn("min-h-10 rounded-full px-4 text-sm font-semibold", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { clearStoredRole(); navigate({ to: "/choose-role" }); }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <Repeat className="size-4" aria-hidden="true" /> {t.switchRole}
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-8">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-3xl px-5 pb-8">
          <div role="alert" className="flex items-center gap-3 rounded-[20px] border-2 border-destructive bg-destructive/10 p-5 text-lg font-semibold text-destructive">
            <Phone className="size-6 shrink-0" aria-hidden="true" /> {t.emergency}
          </div>
          <p className="mt-4 text-center text-sm font-medium text-foreground">{t.general}</p>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t.noData}</p>
        </footer>
      </div>
    </PatientLangContext.Provider>
  );
}
