export async function grokJson(prompt: string, maxTokens = 3500): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      messages: [
        {
          role: "system",
          content:
            "You write bedtime stories as strict JSON. No markdown. No commentary. Vocabulary for children. Never include violence, horror, or adult themes.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `xAI API error ${res.status}` };
  }
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonObject(text);
  if (!parsed) return { ok: false, error: "Could not parse story JSON" };
  return { ok: true, value: parsed };
}

export function parseJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function synthesizeSpeech(text: string, voiceId: string): Promise<{ ok: true; base64: string; mime: string } | { ok: false; error: string }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "Voice is not available" };

  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      output_format: { codec: "mp3" },
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `Voice error ${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return { ok: true, base64: buf.toString("base64"), mime: "audio/mpeg" };
}
