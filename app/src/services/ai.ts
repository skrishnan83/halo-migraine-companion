// AI: sends a short conversation to Groq's GPT-OSS model and returns its reply as text.
// Used by Sprint 3's AI features. halo's AI gives general information only, never a diagnosis.

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
export const AI_MODEL = "openai/gpt-oss-120b";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// askAI(): the one place halo talks to the AI model.
export async function askAI(
  messages: ChatMessage[],
  maxTokens = 800,
): Promise<string> {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error("Missing EXPO_PUBLIC_GROQ_API_KEY in .env");

  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: 0.3, // low = steady, factual wording
      max_completion_tokens: maxTokens,
      reasoning_effort: "low", // quick answers
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `AI request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("The AI sent back an empty answer");
  return text;
}
