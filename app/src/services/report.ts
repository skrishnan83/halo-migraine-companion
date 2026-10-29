// PDF REPORT: builds a one-file report for the doctor and opens the phone's share sheet.
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { AttackItem } from "../hooks/useAttacks";
import { formatMinutes } from "../utils/relief";
import { oneDecimal, summarise } from "../utils/stats";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function date(ms: number) {
  return new Date(ms).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function dateTime(ms: number) {
  return new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function buildReportHtml(
  items: AttackItem[],
  rangeLabel: string,
  email: string,
) {
  const s = summarise(items);
  const sorted = [...items].sort((a, b) => b.startedAtMs - a.startedAtMs);
  const from = sorted.length
    ? date(sorted[sorted.length - 1].startedAtMs)
    : "—";
  const to = sorted.length ? date(sorted[0].startedAtMs) : "—";

  const medRows = s.medications.length
    ? s.medications
        .map(
          (m) =>
            `<tr><td>${esc(m.medication)}</td><td>${m.uses}</td><td>${esc(m.verdict)}</td><td>${formatMinutes(m.averageMinutes)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="muted">No relief ratings yet.</td></tr>`;

  const attackRows = sorted
    .map((a) => {
      const r = a.relief;
      return `<tr>
        <td>${esc(dateTime(a.startedAtMs))}</td>
        <td class="c">${a.severity}</td>
        <td>${esc(a.symptoms.join(", ") || "—")}</td>
        <td>${esc(r ? r.medication || "—" : "Not rated")}</td>
        <td>${esc(r ? r.level : "—")}</td>
        <td>${r ? formatMinutes(r.minutesToRelief) : "—"}</td>
        <td>${esc(a.note || "")}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page { margin: 36px; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #274042; font-size: 11px;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1 { font-family: Georgia, serif; font-size: 26px; margin: 0; }
  h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 2px solid #8FB9A8; padding-bottom: 4px; }
  .sub { color: #6B7C7D; margin-top: 4px; }
  .grid { display: flex; gap: 10px; }
  .box { flex: 1; background: #EEF4F1; border-radius: 8px; padding: 10px; }
  .num { font-size: 20px; font-weight: 700; }
  .label { color: #6B7C7D; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #274042; color: #fff; text-align: left; padding: 6px; font-size: 10px; }
  td { border-bottom: 1px solid #DDE7E3; padding: 6px; vertical-align: top; }
  .c { text-align: center; }
  .muted { color: #6B7C7D; }
  .foot { margin-top: 24px; color: #6B7C7D; font-size: 9px; }
</style></head>
<body>
  <h1>halo migraine report</h1>
  <div class="sub">${esc(email)} &nbsp;·&nbsp; ${esc(rangeLabel)}: ${from} to ${to} &nbsp;·&nbsp; Created ${date(Date.now())}</div>

  <h2>Summary</h2>
  <div class="grid">
    <div class="box"><div class="num">${s.count}</div><div class="label">Attacks</div></div>
    <div class="box"><div class="num">${oneDecimal(s.averageSeverity)}</div><div class="label">Average severity (1–10)</div></div>
    <div class="box"><div class="num">${s.rated ? `${s.goodRelief} of ${s.rated}` : "—"}</div><div class="label">Rated attacks with good relief</div></div>
    <div class="box"><div class="num">${formatMinutes(s.averageMinutes)}</div><div class="label">Average time to relief</div></div>
  </div>
  <p class="muted">Most common symptoms: ${esc(s.topSymptoms.map((t) => `${t.name} (${t.count})`).join(", ") || "none recorded")}</p>

  <h2>What helped</h2>
  <table><tr><th>Medication</th><th>Times used</th><th>Result</th><th>Average time to relief</th></tr>${medRows}</table>

  <h2>Attacks</h2>
  <table>
    <tr><th>Started</th><th>Severity</th><th>Symptoms</th><th>Took</th><th>Relief</th><th>Time to relief</th><th>Note</th></tr>
    ${attackRows || `<tr><td colspan="7" class="muted">No attacks in this period.</td></tr>`}
  </table>

  <div class="foot">Made with halo. halo gives general information only and is not a substitute for medical advice.</div>
</body></html>`;
}

// Makes the PDF and opens the share sheet (Mail, Messages, Files, AirDrop...).
export async function shareReport(
  items: AttackItem[],
  rangeLabel: string,
  email: string,
) {
  const html = buildReportHtml(items, rangeLabel, email);
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this phone");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: ".pdf",
    dialogTitle: "Share your halo report",
  });
}
