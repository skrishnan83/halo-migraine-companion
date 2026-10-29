// RELIEF: the words, scores and time choices used when rating how an attack ended.

export const RELIEF_LEVELS = [
  "None",
  "A little",
  "A lot",
  "Pain-free",
] as const;
export type ReliefLevel = (typeof RELIEF_LEVELS)[number];

// Used to compare medications: a higher score means more relief.
export const RELIEF_SCORE: Record<ReliefLevel, number> = {
  None: 0,
  "A little": 1,
  "A lot": 2,
  "Pain-free": 3,
};

export const EASE_OPTIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4+ hours", minutes: 240 },
];

export const NOTHING = "Nothing";

export type Relief = {
  medication: string; // e.g. "Sumatriptan 50 mg", or "Nothing"
  level: ReliefLevel;
  minutesToRelief: number | null; // null when there was no relief
  ratedAtMs: number;
};

// 30 -> "30 min", 60 -> "1 hr", 90 -> "1.5 hr", 240 -> "4+ hr"
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes >= 240) return "4+ hr";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} hr`;
}

// "Relief: A lot · 1 hr · Sumatriptan 50 mg"
export function reliefSummary(r: Relief): string {
  const parts = [`Relief: ${r.level}`];
  if (r.minutesToRelief !== null) parts.push(formatMinutes(r.minutesToRelief));
  if (r.medication && r.medication !== NOTHING) parts.push(r.medication);
  return parts.join(" · ");
}
