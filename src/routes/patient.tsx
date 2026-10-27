import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Globe, Languages, Phone, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PatientLangContext } from "@/lib/patient-i18n";
import { LANGUAGE_INFO, PATIENT_LANGS, isPatientLang, translate, type PatientLang } from "@/lib/patient-translations";
import { clearStoredRole, setStoredRole } from "@/lib/role";

export const Route = createFileRoute("/patient")({
  component: PatientLayout,
});

const LANG_KEY = "medbridge-patient-lang";

function PatientLayout() {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
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
        <header className="sticky top-0 z-[60] border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-3">
            <Link to="/patient" aria-label="Patient home" className="shrink-0"><Logo /></Link>
            <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                onClick={() => { clearStoredRole(); navigate({ to: "/choose-role" }); }}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Repeat className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">{t("switchRole")}</span><span className="sr-only sm:hidden">{t("switchRole")}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Language / Langue / ${t("language")}`}
                  className="inline-flex min-h-11 max-w-[11rem] shrink-0 items-center gap-2 rounded-full border-2 border-primary bg-card px-3 text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Globe className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate" lang={lang} dir={dir}>{LANGUAGE_INFO[lang].name}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[70] min-w-48">
                  {PATIENT_LANGS.map((l) => (
                    <DropdownMenuItem key={l} onSelect={() => choose(l)} className="min-h-11 gap-3 text-base" lang={l} dir={LANGUAGE_INFO[l].dir}>
                      <Check className={l === lang ? "size-4 text-primary" : "size-4 opacity-0"} aria-hidden="true" />
                      <span className="flex-1 text-start">{LANGUAGE_INFO[l].name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-8 pt-4">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-3xl px-5 pb-28">
          <div role="alert" className="flex items-center gap-3 rounded-[20px] border-2 border-destructive bg-destructive/10 p-5 text-lg font-semibold text-destructive">
            <Phone className="size-6 shrink-0" aria-hidden="true" /> {t("emergency")}
          </div>
          <p className="mt-4 text-center text-sm font-medium text-foreground">{t("general")}</p>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t("noData")}</p>
          {lang !== "en" && <p className="mt-2 text-center text-xs text-muted-foreground">{t("notChecked")}</p>}
        </footer>
        {pathname !== "/patient/translate" && (
          <Link to="/patient/translate" className="btn-primary fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] end-5 z-40 inline-flex min-h-14 items-center gap-2 px-5 text-base font-semibold shadow-lg">
            <Languages className="size-5" aria-hidden="true" /> {t("topic.translate")}
          </Link>
        )}
      </div>
    </PatientLangContext.Provider>
  );
}
