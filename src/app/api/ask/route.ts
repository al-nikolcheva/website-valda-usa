import { searchSite } from "@/lib/site-search";

// "Ask anything" row in the FAQ: smart search over the site's own content.
// No AI, no external service, no API key.

const MAX_QUESTION = 400; // characters

export async function POST(request: Request) {
  let question = "";
  try {
    const body = (await request.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!question) return Response.json({ error: "Please type a question." }, { status: 400 });
  if (question.length > MAX_QUESTION) {
    return Response.json({ error: `Please keep questions under ${MAX_QUESTION} characters.` }, { status: 400 });
  }
  return Response.json(searchSite(question), { headers: { "Cache-Control": "no-store" } });
}
