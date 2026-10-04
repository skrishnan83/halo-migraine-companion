// Sends a voice recording to Groq's Whisper service and returns the text.
import { File as ExpoFile } from "expo-file-system";

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export async function transcribeAudio(uri: string): Promise<string> {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error("Missing EXPO_PUBLIC_GROQ_API_KEY in .env");

  // Newer Expo versions need a real file object, not a { uri } description.
  const audioFile = new ExpoFile(uri);

  const form = new FormData();
  form.append("file", audioFile as unknown as Blob, "recording.m4a");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "en");

  // Don't set a Content-Type header: the app adds the right one for file uploads.
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  const data = (await response.json()) as { text?: string };
  return (data.text ?? "").trim();
}