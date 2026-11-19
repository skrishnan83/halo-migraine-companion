// PREVENTATIVE ALERTS: spots warning patterns in your own logs and explains them.
// Plain rules, not AI, so the same logs always give the same alert.
import type { AttackItem } from "../hooks/useAttacks";
import { NOTHING } from "./relief";

const DAY = 24 * 60 * 60 * 1000;

export type PatternAlert = { title: string; message: string };

// checkPatterns(): returns the alerts to show on Home (an empty list means none).
export function checkPatterns(
  items: AttackItem[],
  now = Date.now(),
): PatternAlert[] {
  const alerts: PatternAlert[] = [];
  const lastWeek = items.filter((a) => a.startedAtMs >= now - 7 * DAY);
  const fourWeeksBefore = items.filter(
    (a) => a.startedAtMs < now - 7 * DAY && a.startedAtMs >= now - 35 * DAY,
  );
  const usualPerWeek = fourWeeksBefore.length / 4;

  // 1. More attacks than usual this week.
  if (lastWeek.length >= 3 && lastWeek.length > usualPerWeek * 2) {
    alerts.push({
      title: "More attacks than usual",
      message: `You've logged ${lastWeek.length} attacks in the last 7 days, more than your usual ${usualPerWeek.toFixed(1)} a week. Rest, water and regular meals can help. If this keeps up, talk to your doctor.`,
    });
  }

  // 2. Severe attacks this week.
  const severe = lastWeek.filter((a) => a.severity >= 8);
  if (severe.length >= 2) {
    alerts.push({
      title: "Severe attacks this week",
      message: `${severe.length} of your attacks in the last 7 days were 8 or higher. Consider talking to your doctor about how your treatment is working.`,
    });
  }

  // 3. Medication on many days (risk of medication-overuse headache).
  const medDays = new Set(
    items
      .filter(
        (a) =>
          a.startedAtMs >= now - 30 * DAY &&
          a.relief &&
          a.relief.medication !== NOTHING,
      )
      .map((a) => new Date(a.startedAtMs).toDateString()),
  );
  if (medDays.size >= 10) {
    alerts.push({
      title: "Medication on many days",
      message: `You took medication on ${medDays.size} days in the last 30. Taking migraine medicine on 10 or more days a month can cause more headaches (medication-overuse headache). Talk to your doctor.`,
    });
  }

  return alerts;
}
