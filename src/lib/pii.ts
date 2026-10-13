// Heuristic check for personal details before anything is published.
export type PiiHit = "phone number" | "email address" | "birth date" | "full name";

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /(\+|00)\d[\d\s/.-]{7,}\d|\b0\d{2}[\s/.-]?\d{3}[\s/.-]?\d{2}[\s/.-]?\d{2}\b/;
const DATE = /\b(0?[1-9]|[12]\d|3[01])[./-](0?[1-9]|1[0-2])[./-](19|20)?\d{2}\b|\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b|\b(born|geboren|né|née|DOB|date of birth)\b/i;
const TITLED = /\b(Mr|Mrs|Ms|Miss|Herr|Frau|Mme|Mlle|Monsieur|Madame|Signor|Signora)\.?\s+[A-ZÀ-Ý][a-zà-ÿ'-]+/;
const NAMED = /\b(named|called|name is|patient)\s+[A-ZÀ-Ý][a-zà-ÿ'-]+\s+[A-ZÀ-Ý][a-zà-ÿ'-]+/;

export function findPii(text: string): PiiHit[] {
  const hits: PiiHit[] = [];
  if (EMAIL.test(text)) hits.push("email address");
  if (PHONE.test(text)) hits.push("phone number");
  if (DATE.test(text)) hits.push("birth date");
  if (TITLED.test(text) || NAMED.test(text)) hits.push("full name");
  return hits;
}

export function piiWarning(hits: PiiHit[]): string {
  return `This looks like it contains a ${hits.join(", ")}. Please remove it and refer to the patient by case code only.`;
}
