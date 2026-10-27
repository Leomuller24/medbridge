import { createContext, useCallback, useContext } from "react";

import { LANGUAGE_INFO, translate, type PatientKey, type PatientLang } from "@/lib/patient-translations";

export type { PatientLang, PatientKey };

export const PATIENT_TOPICS = ["prepare", "explain", "healthcare", "rights"] as const;
export type PatientTopic = (typeof PATIENT_TOPICS)[number];

export const PatientLangContext = createContext<PatientLang>("en");

export function usePatientLang(): PatientLang {
  return useContext(PatientLangContext);
}

/** Returns t(key) in the selected language (English fallback), plus lang and dir. */
export function useT() {
  const lang = useContext(PatientLangContext);
  const t = useCallback((key: PatientKey) => translate(key, lang), [lang]);
  return { t, lang, dir: LANGUAGE_INFO[lang].dir };
}
