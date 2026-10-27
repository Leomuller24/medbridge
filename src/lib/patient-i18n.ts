import { createContext, useContext } from "react";

export type PatientLang = "en" | "fr";

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
  },
} as const;

export const PatientLangContext = createContext<PatientLang>("en");
export function usePatientText() {
  return PATIENT_TEXT[useContext(PatientLangContext)];
}
