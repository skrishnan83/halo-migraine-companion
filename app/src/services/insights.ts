// TREATMENT INSIGHTS: turns the numbers on History into a short, plain-language summary.
// Only the summary numbers are sent to the AI: no email, no notes, no dates.
import type { Summary } from "../utils/stats";
import { formatMinutes } from "../utils/relief";
import { askAI } from "./ai";

const INSIGHT_RULES = `You are halo's treatment insight helper for a migraine tracking app.
Explain the person's own migraine log in plain, friendly language.
Rules:
- Use ONLY the numbers you are given. Never invent numbers.
- At most 4 short sentences, no headings, no bullet points, no markdown.
- Say which medication has worked best for them and how fast, when the data shows it.
- If fewer than 3 attacks have a relief rating, say there is not enough data yet and encourage rating relief after each attack.
- Never diagnose. Never tell them to start, stop or change a medication or dose. You may suggest talking it over with their doctor.`;

// insightFacts(): builds the facts the AI is allowed to use.
export function insightFacts(s: Summary, rangeLabel: string): string {
  const lines = [
    `Time range: ${rangeLabel}`,
    `Attacks logged: ${s.count}`,
    `Average severity (1 to 10): ${s.averageSeverity === null ? "none" : s.averageSeverity.toFixed(1)}`,
    `Attacks with a relief rating: ${s.rated}`,
    `Rated attacks with good relief ("A lot" or "Pain-free"): ${s.goodRelief}`,
    `Average time to relief: ${formatMinutes(s.averageMinutes)}`,
    `Most common symptoms: ${s.topSymptoms.map((t) => `${t.name} (${t.count})`).join(", ") || "none"}`,
    "Medications (relief score 0 = none to 3 = pain-free):",
    ...(s.medications.length
      ? s.medications.map(
          (m) =>
            `- ${m.medication}: used ${m.uses} times, average relief score ${m.averageScore.toFixed(1)}, average time to relief ${formatMinutes(m.averageMinutes)}, verdict "${m.verdict}"`,
        )
      : ["- none rated yet"]),
  ];
  return lines.join("\n");
}

// getTreatmentInsight(): asks the AI for the summary shown under "AI insight" on History.
export function getTreatmentInsight(s: Summary, rangeLabel: string) {
  return askAI([
    { role: "system", content: INSIGHT_RULES },
    { role: "user", content: insightFacts(s, rangeLabel) },
  ]);
}
