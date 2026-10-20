import type { Report } from "./reports";
// Symptom list is the curated Swiss SNOMED CT set. Briefing text is still example content.

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

// Curated Swiss SNOMED CT symptom list: [code, preferred term, category]
const SNOMED_ROWS: [string, string, string][] = [
  ["21522001", "Abdominal pain", "Pain"],
  ["29857009", "Chest pain", "Pain"],
  ["57676002", "Joint pain", "Pain"],
  ["68962001", "Muscle pain", "Pain"],
  ["162397003", "Sore throat", "Pain"],
  ["25064002", "Headache", "Pain"],
  ["386661006", "Fever", "General"],
  ["103001002", "Feeling feverish", "General"],
  ["43724002", "Chill", "General"],
  ["38880002", "Rigor", "General"],
  ["84229001", "Fatigue", "General"],
  ["367391008", "Malaise", "General"],
  ["26544005", "Muscle weakness", "General"],
  ["79890006", "Loss of appetite", "General"],
  ["49727002", "Cough", "Respiratory"],
  ["267036007", "Dyspnea", "Respiratory"],
  ["23924001", "Tight chest", "Respiratory"],
  ["56018004", "Wheezing", "Respiratory"],
  ["68235000", "Nasal congestion", "Respiratory"],
  ["64531003", "Nasal discharge", "Respiratory"],
  ["66857006", "Hemoptysis", "Respiratory"],
  ["82272006", "Common cold", "Respiratory"],
  ["422587007", "Nausea", "Gastrointestinal"],
  ["422400008", "Vomiting", "Gastrointestinal"],
  ["62315008", "Diarrhea", "Gastrointestinal"],
  ["271807003", "Skin rash", "Skin"],
  ["46742003", "Skin ulcer", "Skin"],
  ["9826008", "Conjunctivitis", "Eye"],
  ["44169009", "Loss of smell", "Sensory"],
  ["36955009", "Loss of taste", "Sensory"],
  ["44077006", "Numbness", "Sensory"],
  ["30746006", "Swollen glands", "General"],
  ["131148009", "Bleeding", "General"],
  ["3006004", "Disturbance of consciousness", "Neurological"],
  ["91175000", "Seizure", "Neurological"],
  ["282145008", "Unable to walk", "Mobility"],
  ["3415004", "Cyanosis", "General"],
  ["84387000", "Asymptomatic", "General"],
];

export type Symptom = { code: string; term: string; category: string };
export const SNOMED_SYMPTOMS: Symptom[] = SNOMED_ROWS.map(([code, term, category]) => ({ code, term, category }));
export const SYMPTOMS = SNOMED_SYMPTOMS.map((s) => s.term);
export const SYMPTOM_CATEGORIES = [...new Set(SNOMED_SYMPTOMS.map((s) => s.category))];

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
  interpreterNeeded?: boolean | undefined;
  commPrefs?: string | undefined;
};

export type NoteRecord = {
  id: string;
  caseId: string;
  text: string;
  visibility: "private" | "shared";
  createdAt: string;
  patientAgreed?: boolean | undefined;
  source?: string | undefined;
};

export type Reply = { id: string; author: string; text: string; createdAt: string; replies?: Reply[]; reports?: Report[] | undefined; hidden?: boolean | undefined; helpful?: number | undefined };

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
  source?: string | undefined;
  reports?: Report[] | undefined;
  hidden?: boolean | undefined;
  /** First answer that received a helpful vote; earns a bonus. */
  bonusReplyId?: string | undefined;
};

export const COMMUNITY_CATEGORIES = ["All", "Communication", "Cultural context", "Interpreting", "Family care"];

export const SEED_CASES: CaseRecord[] = [
  { id: "c1", code: "CASE-A14", language: "Tigrinya", date: "2026-10-01", symptoms: ["Headache", "Fatigue"], redFlags: ["Interpreter needed for every visit"] },
  { id: "c2", code: "CASE-B07", language: "Arabic", date: "2026-09-28", symptoms: ["Abdominal pain"], redFlags: [] },
  { id: "c3", code: "CASE-C22", language: "Ukrainian", date: "2026-09-24", symptoms: ["Malaise", "Fatigue"], redFlags: ["Prefers female provider"] },
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

// Example synonyms (lay terms) used by search. Example content, to be reviewed.
export const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  "Abdominal pain": ["stomach ache", "belly pain", "tummy ache", "cramps"],
  "Chest pain": ["chest tightness", "heart pain", "pressure in chest"],
  "Joint pain": ["aching joints", "arthralgia"],
  "Muscle pain": ["myalgia", "body aches", "sore muscles"],
  "Sore throat": ["throat pain", "scratchy throat"],
  Headache: ["head pain", "migraine", "pressure in head"],
  Fever: ["high temperature", "pyrexia", "hot"],
  "Feeling feverish": ["feeling hot", "hot and cold"],
  Chill: ["chills", "shivering", "feeling cold"],
  Rigor: ["shaking chills", "shaking"],
  Fatigue: ["tiredness", "exhaustion", "no energy", "weakness"],
  Malaise: ["feeling unwell", "general discomfort"],
  "Muscle weakness": ["weak muscles", "loss of strength"],
  "Loss of appetite": ["not hungry", "anorexia", "no appetite"],
  Cough: ["coughing"],
  Dyspnea: ["shortness of breath", "breathlessness", "difficulty breathing"],
  "Tight chest": ["chest tightness", "heavy chest"],
  Wheezing: ["whistling breath"],
  "Nasal congestion": ["blocked nose", "stuffy nose"],
  "Nasal discharge": ["runny nose"],
  Hemoptysis: ["coughing blood", "blood in sputum"],
  "Common cold": ["cold", "flu-like"],
  Nausea: ["feeling sick", "queasy"],
  Vomiting: ["being sick", "throwing up"],
  Diarrhea: ["diarrhoea", "loose stools", "runny stomach"],
  "Skin rash": ["rash", "spots", "itchy skin"],
  "Skin ulcer": ["open sore", "wound"],
  Conjunctivitis: ["pink eye", "red eye"],
  "Loss of smell": ["anosmia", "can't smell"],
  "Loss of taste": ["ageusia", "can't taste"],
  Numbness: ["tingling", "pins and needles"],
  "Swollen glands": ["swollen lymph nodes", "lumps in neck"],
  Bleeding: ["blood loss", "haemorrhage"],
  "Disturbance of consciousness": ["confusion", "fainting", "drowsy"],
  Seizure: ["fit", "convulsion", "epilepsy"],
  "Unable to walk": ["can't walk", "difficulty walking"],
  Cyanosis: ["blue lips", "bluish skin"],
  Asymptomatic: ["no symptoms"],
};

// Example equivalents in patient languages (transliterated where needed). Example content, to be reviewed.
export const SYMPTOM_TRANSLATIONS: Record<string, Record<string, string>> = {
  Arabic: { Headache: "صداع (sudaa)", Fever: "حمى (humma)", Cough: "سعال (suaal)", "Abdominal pain": "ألم في البطن (alam fil batn)", Fatigue: "تعب (taab)", Nausea: "غثيان (ghathayan)", Vomiting: "تقيؤ (taqayyu)", Diarrhea: "إسهال (ishaal)", "Chest pain": "ألم في الصدر (alam fis sadr)", Dyspnea: "ضيق تنفس (dayq tanaffus)", "Sore throat": "التهاب الحلق (iltihab al halq)", "Skin rash": "طفح جلدي (tafh jildi)" },
  Turkish: { Headache: "baş ağrısı", Fever: "ateş", Cough: "öksürük", "Abdominal pain": "karın ağrısı", Fatigue: "yorgunluk", Nausea: "bulantı", Vomiting: "kusma", Diarrhea: "ishal", "Chest pain": "göğüs ağrısı", Dyspnea: "nefes darlığı", "Sore throat": "boğaz ağrısı", "Skin rash": "döküntü" },
  Ukrainian: { Headache: "головний біль (holovnyi bil)", Fever: "гарячка (hariachka)", Cough: "кашель (kashel)", "Abdominal pain": "біль у животі (bil u zhyvoti)", Fatigue: "втома (vtoma)", Nausea: "нудота (nudota)", Vomiting: "блювання (bliuvannia)", Diarrhea: "діарея (diareia)", "Chest pain": "біль у грудях (bil u hrudiakh)", Dyspnea: "задишка (zadyshka)", "Sore throat": "біль у горлі (bil u horli)", Malaise: "нездужання (nezduzhannia)" },
  Albanian: { Headache: "dhimbje koke", Fever: "ethe", Cough: "kollë", "Abdominal pain": "dhimbje barku", Fatigue: "lodhje", Nausea: "të përziera", Vomiting: "të vjella", Diarrhea: "diarre", "Chest pain": "dhimbje gjoksi", Dyspnea: "vështirësi në frymëmarrje" },
  Spanish: { Headache: "dolor de cabeza", Fever: "fiebre", Cough: "tos", "Abdominal pain": "dolor abdominal", Fatigue: "cansancio", Nausea: "náuseas", Vomiting: "vómitos", Diarrhea: "diarrea", "Chest pain": "dolor de pecho", Dyspnea: "falta de aire", "Sore throat": "dolor de garganta", "Skin rash": "sarpullido" },
  Portuguese: { Headache: "dor de cabeça", Fever: "febre", Cough: "tosse", "Abdominal pain": "dor abdominal", Fatigue: "cansaço", Nausea: "náusea", Vomiting: "vômito", Diarrhea: "diarreia", "Chest pain": "dor no peito", Dyspnea: "falta de ar", "Sore throat": "dor de garganta" },
  Tigrinya: { Headache: "ሕማም ርእሲ (himam rasi)", Fever: "ረስኒ (resni)", Cough: "ሰዓል (seal)", "Abdominal pain": "ሕማም ከብዲ (himam kebdi)", Fatigue: "ድኻም (dikham)" },
  Dari: { Headache: "سردرد (sardard)", Fever: "تب (tab)", Cough: "سرفه (sorfa)", "Abdominal pain": "دل‌درد (deldard)", Fatigue: "خستگی (khastagi)" },
};

export type Article = { id: string; title: string; summary: string; tags: string[]; source: string; url: string };

export const ARTICLES: Article[] = [
  { id: "a1", title: "Interpreting in healthcare for asylum seekers", summary: "Explains the interpreting services available to healthcare staff in Switzerland, including the national telephone interpreting service and on-site intercultural interpreting.", tags: ["interpreting", "asylum", "Switzerland", "communication"], source: "Federal Office of Public Health (BAG)", url: "https://www.bag.admin.ch/dam/bag/en/dokumente/nat-gesundheitsstrategien/nat-programm-migration-und-gesundheit/dok-2019/interpretariato-nellassistenza-sanitaria-richiedenti-asilo.pdf.download.pdf/interpreting-in-healthcare-for-asylum-seekers.pdf" },
  { id: "a2", title: "Care and cost trajectories of asylum seekers in a nurse-led, patient-centered care network in Switzerland", summary: "A descriptive study of asylum seekers in the canton of Vaud, showing how contacts with a nurse-led migrant care unit were highest in the first year before patients moved to the regular health system.", tags: ["Vaud", "asylum", "primary care", "care coordination"], source: "BMC Health Services Research, via PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8272910" },
  { id: "a3", title: "Disease burden in a large cohort of asylum seekers and refugees in Germany", summary: "Analyses diagnoses among asylum seekers and refugees seeking care in Germany. Symptoms without a specific diagnosis and respiratory infections were common, and mental health diagnoses were recorded less often than other evidence would suggest.", tags: ["symptoms", "mental health", "infections", "Germany"], source: "PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7897448/" },
  { id: "a4", title: "Barriers, Resources and Reserves Shaping Older Migrants' Access to Healthcare", summary: "Looks at unmet needs, missed diagnoses and gaps in existing Swiss programs for older migrants.", tags: ["older migrants", "access", "Switzerland", "barriers"], source: "PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12433906/" },
  { id: "a5", title: "Health of undocumented migrants in primary care in Switzerland", summary: "Describes how undocumented migrants in Switzerland are often limited to emergency care and may rely on healthcare from their home country.", tags: ["undocumented", "primary care", "Switzerland", "access"], source: "PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6063438/" },
  { id: "a6", title: "Improving Primary Healthcare Access for Asylum Seekers and Refugees (a Swiss GP perspective)", summary: "Explains how fragmentation between cantons affects access to primary care for asylum seekers and refugees in Switzerland.", tags: ["asylum", "cantons", "general practitioners", "access"], source: "PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10328165/" },
  { id: "a7", title: "Barriers to outpatient mental health care for refugees and asylum seekers (therapists' view)", summary: "Gives the therapist-side view of what blocks refugees and asylum seekers from getting outpatient mental health care.", tags: ["mental health", "refugees", "therapy", "barriers"], source: "PubMed Central", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7366894/" },
  { id: "a8", title: "Structural and socio-cultural barriers to mental healthcare among Syrian refugees", summary: "Examines cultural mismatch and structural obstacles to mental healthcare for Syrian refugees, and supports the idea of peer co-therapists.", tags: ["mental health", "Syria", "culture", "stigma"], source: "PubMed Central", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7034440/" },
  { id: "a9", title: "Electronic Tools to Bridge the Language Gap in Health Care (systematic review)", summary: "Reviews interpreter apps and translation tools and notes that their real impact on care is still unclear.", tags: ["translation", "language", "digital tools", "interpreting"], source: "PubMed Central", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8138704/" },
  { id: "a10", title: "Digital solutions for migrant and refugee health: a framework for analysis and action", summary: "Describes the digital divide and the risk that app design ignores migrants' real preferences.", tags: ["digital health", "migrants", "design", "access"], source: "The Lancet Regional Health, Europe", url: "https://www.thelancet.com/journals/lanepe/article/PIIS2666-7762(24)00359-4/fulltext" },
];
