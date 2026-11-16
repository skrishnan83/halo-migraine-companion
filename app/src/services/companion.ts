// SYMPTOM COMPANION: answers migraine questions with general information only.
import { askAI, type ChatMessage } from "./ai";

// Warning signs that need urgent care. halo checks for these itself,
// so the warning never depends on the AI.
const RED_FLAGS = [
  "worst headache",
  "worst ever",
  "worst migraine",
  "worst pain",
  "thunderclap",
  "sudden severe",
  "came on suddenly",
  "numb",
  "weakness",
  "can't speak",
  "trouble speaking",
  "slurred",
  "confus",
  "passed out",
  "stiff neck",
  "head injury",
  "hit my head",
  "lost vision",
  "lose vision",
  "seizure",
];

// hasRedFlag(): true if the question mentions a warning sign.
export function hasRedFlag(question: string): boolean {
  const q = question.toLowerCase();
  return RED_FLAGS.some((word) => q.includes(word));
}

const COMPANION_RULES = `You are halo's Symptom Companion in a migraine tracking app.
Answer questions about migraine with general, well-established information, in plain friendly language.
Rules:
- At most 5 short sentences. No headings, no markdown.
- Never diagnose, and never say what the person "has".
- Never recommend a specific medicine, dose or change to their treatment. Suggest asking their doctor or pharmacist.
- If the question mentions a sudden or "worst ever" headache, weakness, numbness, confusion, trouble speaking, fever with a stiff neck, a head injury or vision loss, tell them to call 911 or go to the emergency room now.
- If the question is not about headache or migraine, say you can only help with migraine questions.`;

// askCompanion(): sends the chat so far plus the new question to the AI.
export function askCompanion(chat: ChatMessage[], question: string) {
  return askAI([
    { role: "system", content: COMPANION_RULES },
    ...chat.slice(-6), // the last few messages, so follow-up questions make sense
    { role: "user", content: question },
  ]);
}
