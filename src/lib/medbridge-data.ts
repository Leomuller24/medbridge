// Example content only. Replace with the curated Swiss SNOMED symptom list and reviewed briefings.

export const ROLES = ["Doctor", "Nurse", "Interpreter", "Other"] as const;

export const INTERESTS = [
  "Primary care",
  "Emergency care",
  "Maternity",
  "Paediatrics",
  "Mental health",
  "Chronic conditions",
  "Elderly care",
  "Interpreting",
];

export const LANGUAGES = [
  "Arabic",
  "Tigrinya",
  "Dari",
  "Pashto",
  "Turkish",
  "Kurdish",
  "Albanian",
  "Ukrainian",
  "Tamil",
  "Somali",
  "Portuguese",
  "Spanish",
];

export const SYMPTOMS = [
  "Abdominal pain", "Back pain", "Breathlessness", "Chest pain", "Chills", "Constipation", "Cough",
  "Diarrhoea", "Dizziness", "Ear pain", "Fatigue", "Fever", "Headache", "Heart palpitations",
  "Heartburn", "Itching", "Joint pain", "Loss of appetite", "Low mood", "Muscle pain", "Nausea",
  "Neck pain", "Numbness", "Painful urination", "Rash", "Runny nose", "Shortness of breath on exertion",
  "Sleep problems", "Sore throat", "Sweating", "Swelling of legs", "Toothache", "Tremor", "Vomiting",
  "Weight loss", "Wheezing", "Worry or anxiety", "Blurred vision", "Eye redness", "Fainting",
  "Frequent urination", "Hair loss", "Hearing loss", "Hoarseness", "Menstrual pain", "Nosebleed",
  "Pelvic pain", "Restlessness", "Shoulder pain", "Stomach cramps",
];

export type Briefing = {
  symptom: string;
  patientDescription: string[];
  culturalContext: string[];
  familyPerspective: string[];
  questions: string[];
};

export function getBriefing(symptom: string, language: string): Briefing {
  const s = symptom.toLowerCase();
  return {
    symptom,
    patientDescription: [
      `A ${language}-speaking patient may describe ${s} through everyday images, such as heat, heaviness or something "sitting" in the body, rather than a precise location.`,
      `They may first mention a general feeling of being unwell before naming ${s} directly.`,
    ],
    culturalContext: [
      "Some patients wait to be asked before sharing details, out of politeness or respect for the provider.",
      "Discomfort may be understated, especially in front of family members or a provider of a different gender.",
      "Use a trained interpreter rather than a relative where possible, so the patient can speak freely.",
    ],
    familyPerspective: [
      `Relatives may describe ${s} in terms of what the person can no longer do at home, for example cooking, working or caring for children.`,
      "Family members may speak on the patient's behalf; gently invite the patient to describe it in their own words too.",
    ],
    questions: [
      `When did you first notice the ${s}?`,
      "How does it affect your daily life?",
      "What words would you use to describe it in your own language?",
      "Is there anything about your situation you would like me to understand?",
    ],
  };
}

export type CaseRecord = {
  id: string;
  code: string;
  language: string;
  date: string;
  symptoms: string[];
  redFlags: string[];
};

export type NoteRecord = {
  id: string;
  caseId: string;
  text: string;
  visibility: "private" | "shared";
  createdAt: string;
};

export type Reply = { id: string; author: string; text: string; createdAt: string; replies?: Reply[] };

export type Post = {
  id: string;
  category: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  helpful: number;
  language: string;
  replies: Reply[];
};

export const COMMUNITY_CATEGORIES = ["All", "Communication", "Cultural context", "Interpreting", "Family care"];

export const SEED_CASES: CaseRecord[] = [
  { id: "c1", code: "CASE-A14", language: "Tigrinya", date: "2026-10-01", symptoms: ["Headache", "Sleep problems"], redFlags: ["Interpreter needed for every visit"] },
  { id: "c2", code: "CASE-B07", language: "Arabic", date: "2026-09-28", symptoms: ["Abdominal pain"], redFlags: [] },
  { id: "c3", code: "CASE-C22", language: "Ukrainian", date: "2026-09-24", symptoms: ["Low mood", "Fatigue"], redFlags: ["Prefers female provider"] },
];

export const SEED_NOTES: NoteRecord[] = [
  { id: "n1", caseId: "c1", text: "Patient preferred to speak through a professional interpreter rather than a cousin.", visibility: "private", createdAt: "2026-10-01T09:30:00Z" },
  { id: "n2", caseId: "c3", text: "Describing tiredness as 'the soul is heavy' helped open the conversation.", visibility: "shared", createdAt: "2026-09-24T14:10:00Z" },
];

export const SEED_POSTS: Post[] = [
  {
    id: "p1",
    category: "Interpreting",
    title: "Working with phone interpreters for Tigrinya",
    body: "Booking a phone interpreter a day ahead made a big difference. Short sentences and pauses helped the interpreter keep up.",
    author: "Nurse · Bern",
    createdAt: "2026-10-02T08:00:00Z",
    helpful: 14,
    language: "Tigrinya",
    replies: [{ id: "r1", author: "Interpreter · Zürich", text: "Agreed. Sharing the topic in advance also helps us prepare vocabulary.", createdAt: "2026-10-02T10:00:00Z" }],
  },
  {
    id: "p2",
    category: "Family care",
    title: "When relatives answer for the patient",
    body: "I now thank the family first, then ask the patient directly with the interpreter. It keeps everyone involved without losing the patient's voice.",
    author: "Doctor · Lausanne",
    createdAt: "2026-09-29T12:00:00Z",
    helpful: 22,
    language: "Arabic",
    replies: [],
  },
  {
    id: "p3",
    category: "Cultural context",
    title: "Metaphors for low mood",
    body: "Several patients described low mood using body images rather than emotional words. Asking about sleep and energy first felt less intrusive.",
    author: "Doctor · Basel",
    createdAt: "2026-09-20T15:00:00Z",
    helpful: 9,
    language: "Ukrainian",
    replies: [],
  },
];
