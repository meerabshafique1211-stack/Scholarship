// Optional AI layer (Anthropic Messages API). Server-side only; the key never reaches the browser.
// Every prompt forbids inventing facts: missing information must be reported as missing.

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const NO_FABRICATION = [
  "You help international students prepare scholarship applications.",
  "Use ONLY facts present in the provided documents and form fields.",
  "Never invent or embellish degrees, grades, GPA, employers, dates, projects, research, publications, awards, skills, certifications or languages.",
  "If something is missing, say it is missing, or use a placeholder in square brackets like [ADD: your project result].",
  "Never promise admission or a scholarship. Use phrases like 'potentially relevant', 'appears to meet the published criteria', 'requires verification'.",
].join(" ");

export async function askClaude(task: string, input: string, maxTokens = 1800): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: "AI features are not configured on this site." };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: maxTokens,
        system: `${NO_FABRICATION}\n\n${task}`,
        messages: [{ role: "user", content: input }],
      }),
    });
    if (res.status === 429) return { ok: false, error: "The AI service is busy. Please try again in a minute." };
    if (!res.ok) return { ok: false, error: "The AI service is unavailable right now." };
    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
    return text ? { ok: true, text } : { ok: false, error: "The AI service returned no text." };
  } catch {
    return { ok: false, error: "The AI service did not respond in time." };
  }
}
