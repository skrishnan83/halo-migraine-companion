// TRENDS: turns a list of attacks into the numbers shown on History and in the PDF report.
import type { AttackItem } from "../hooks/useAttacks";
import { NOTHING, RELIEF_SCORE } from "./relief";

export const RANGES = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All", days: 0 },
];

const DAY = 24 * 60 * 60 * 1000;

export function inRange(items: AttackItem[], days: number, now = Date.now()) {
  return days ? items.filter((a) => a.startedAtMs >= now - days * DAY) : items;
}

function average(nums: number[]): number | null {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : null;
}

export type MedicationResult = {
  medication: string;
  uses: number;
  averageScore: number; // 0 (none) to 3 (pain-free)
  averageMinutes: number | null;
  verdict: string;
};

export type Summary = {
  count: number;
  averageSeverity: number | null;
  rated: number;
  goodRelief: number; // "A lot" or "Pain-free"
  averageMinutes: number | null;
  topSymptoms: { name: string; count: number }[];
  medications: MedicationResult[];
};

function verdict(score: number) {
  if (score >= 2) return "Works well";
  if (score >= 1) return "Some help";
  return "Little help";
}

export function summarise(items: AttackItem[]): Summary {
  const rated = items.filter((a) => a.relief);
  const minutes = rated
    .map((a) => a.relief!.minutesToRelief)
    .filter((m): m is number => m !== null);

  const symptomCount = new Map<string, number>();
  items.forEach((a) =>
    a.symptoms.forEach((s) =>
      symptomCount.set(s, (symptomCount.get(s) ?? 0) + 1),
    ),
  );

  const byMed = new Map<string, { scores: number[]; minutes: number[] }>();
  rated.forEach((a) => {
    const r = a.relief!;
    const name = r.medication || NOTHING;
    if (name === NOTHING) return;
    const entry = byMed.get(name) ?? { scores: [], minutes: [] };
    entry.scores.push(RELIEF_SCORE[r.level]);
    if (r.minutesToRelief !== null) entry.minutes.push(r.minutesToRelief);
    byMed.set(name, entry);
  });

  const medications = [...byMed.entries()]
    .map(([medication, e]) => {
      const averageScore = average(e.scores) ?? 0;
      return {
        medication,
        uses: e.scores.length,
        averageScore,
        averageMinutes: average(e.minutes),
        verdict: verdict(averageScore),
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore || b.uses - a.uses);

  return {
    count: items.length,
    averageSeverity: average(items.map((a) => a.severity)),
    rated: rated.length,
    goodRelief: rated.filter((a) => RELIEF_SCORE[a.relief!.level] >= 2).length,
    averageMinutes: average(minutes),
    topSymptoms: [...symptomCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    medications,
  };
}

// Attacks per week for the last `weeks` weeks, oldest first (for the bar chart).
export function weeklyCounts(items: AttackItem[], weeks = 8, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // this week's Sunday
  const result: { label: string; count: number }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const from = start.getTime() - w * 7 * DAY;
    const to = from + 7 * DAY;
    result.push({
      label: new Date(from).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }),
      count: items.filter((a) => a.startedAtMs >= from && a.startedAtMs < to)
        .length,
    });
  }
  return result;
}

// "Today, 11:51 AM", "Yesterday, 9:30 PM", or "Oct 2, 4:15 PM"
export function formatWhen(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString())
    return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export function oneDecimal(n: number | null): string {
  return n === null ? "—" : (Math.round(n * 10) / 10).toString();
}
