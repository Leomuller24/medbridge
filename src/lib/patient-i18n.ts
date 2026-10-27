import { createContext, useContext } from "react";

export const PLACEHOLDER = { en: "Placeholder — official wording will be added here later.", fr: "Espace réservé — le texte officiel sera ajouté ici plus tard." } as const;
export function usePatientLang() {
  return useContext(PatientLangContext);
}

import type { ExtraLang } from "@/lib/symptom-translations";

export type PatientLang = "en" | "fr" | ExtraLang;

export const PATIENT_TOPICS = ["prepare", "explain", "healthcare", "rights"] as const;
export type PatientTopic = (typeof PATIENT_TOPICS)[number];

export const PATIENT_TEXT = {
  en: {
    hello: "Hello! How can we help?",
    intro: "Pick one. It's quick and simple.",
    topics: {
      prepare: "Prepare my appointment",
      explain: "Explain what is wrong",
      healthcare: "How healthcare works here",
      rights: "My rights and my privacy",
    },
    soon: "This page is coming soon.",
    back: "Back",
    switchRole: "Switch role",
    emergency: "In an emergency call 144 or 112.",
    noData: "MedBridge does not store patient data.",
    general: "This tool gives general information. It does not replace a doctor and cannot diagnose.",
  },
  fr: {
    hello: "Bonjour ! Comment pouvons-nous aider ?",
    intro: "Choisis une option. C'est simple et rapide.",
    topics: {
      prepare: "Préparer mon rendez-vous",
      explain: "Expliquer ce qui ne va pas",
      healthcare: "Comment fonctionne la santé ici",
      rights: "Mes droits et ma vie privée",
    },
    soon: "Cette page arrive bientôt.",
    back: "Retour",
    switchRole: "Changer de rôle",
    emergency: "En cas d'urgence, appelle le 144 ou le 112.",
    noData: "MedBridge ne conserve aucune donnée de patient.",
    general: "Cet outil donne des informations générales. Il ne remplace pas un médecin et ne peut pas poser de diagnostic.",
  },
} as const;

export const PatientLangContext = createContext<PatientLang>("en");
export function usePatientText() {
  const l = useContext(PatientLangContext);
  // Other patient pages are only in English and French for now.
  return PATIENT_TEXT[l === "fr" ? "fr" : "en"];
}
