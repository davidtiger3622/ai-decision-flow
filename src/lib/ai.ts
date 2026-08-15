import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function decide(prompt: string): Promise<"yes" | "no"> {
  const response = await client.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You answer strictly with a single word: YES or NO. No punctuation, no explanation.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  const text = response.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
  return text.startsWith("YES") ? "yes" : "no";
}
