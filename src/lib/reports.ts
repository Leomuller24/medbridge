export const REPORT_REASONS = ["Misinformation", "Personal information", "Spam or advertising", "Disrespectful", "Other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
/** Matches the backend rule: content with this many reports is hidden. */
export const HIDE_THRESHOLD = 3;
