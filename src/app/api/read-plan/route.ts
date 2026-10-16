import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// "Build your project" → Upload plans. Sends the visitor's floor plan, elevation or
// window schedule to Claude and returns opening counts the builder fills in.
//   ANTHROPIC_API_KEY   required (add it in the hosting environment)
// Without a key it answers 503 and the builder asks the visitor to enter counts by hand,
// so the flow still works; the file name still travels with the inquiry.

const MAX_BYTES = 20 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const PlanSchema = z.object({
  readable: z.boolean(),
  buildingType: z.enum(["house", "building", "unknown"]),
  windows: z.number().int(),
  entryDoors: z.number().int(),
  slidingDoors: z.number().int(),
  curtainWallBays: z.number().int(),
  windowStyles: z.array(z.string()),
  notes: z.string(),
});

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["readable", "buildingType", "windows", "entryDoors", "slidingDoors", "curtainWallBays", "windowStyles", "notes"],
  properties: {
    readable: { type: "boolean", description: "False if the file is not an architectural drawing or schedule." },
    buildingType: { type: "string", enum: ["house", "building", "unknown"] },
    windows: { type: "integer", description: "Total exterior windows (each unit counted once, mulled units counted per unit)." },
    entryDoors: { type: "integer", description: "Exterior hinged/swing doors." },
    slidingDoors: { type: "integer", description: "Exterior sliding, lift & slide or folding glass doors." },
    curtainWallBays: { type: "integer", description: "Curtain wall / storefront bays (vertical modules between mullions), 0 if none." },
    windowStyles: { type: "array", items: { type: "string" }, description: "Operating types seen, e.g. Fixed, Casement, Tilt & turn, Awning, Single hung." },
    notes: { type: "string", description: "One or two plain sentences for the visitor: what was read and anything uncertain." },
  },
} as const;

const PROMPT = `You are an estimator at a window and door manufacturer. The attached file is a client's floor plan, elevation, or window/door schedule.
Count the EXTERIOR openings only: windows, exterior swing doors, sliding/lift & slide/folding glass doors, and curtain wall bays. Ignore interior doors, garage doors, skylights and openings that are clearly existing-to-remain.
If a schedule lists quantities, trust the schedule. If the plan shows several floors, add them up. If something is ambiguous, give your best count and say so in the notes.
If the file is not a drawing or schedule, set readable to false and all counts to 0.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Automatic plan reading is not switched on yet. Enter your counts below and we will check them against your plans." }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file) return Response.json({ error: "Please choose a file." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Please keep files under 20 MB." }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  let doc: Anthropic.ContentBlockParam;
  if (file.type === "application/pdf") {
    doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data } };
  } else if ((IMAGE_TYPES as readonly string[]).includes(file.type)) {
    doc = { type: "image", source: { type: "base64", media_type: file.type as ImageType, data } };
  } else {
    return Response.json({ error: "Upload a PDF, PNG, JPG or WEBP." }, { status: 415 });
  }

  const client = new Anthropic();
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: [doc, { type: "text", text: PROMPT }] }],
    });
    if (res.stop_reason === "refusal") {
      return Response.json({ error: "We could not read that file. Enter your counts below instead." }, { status: 422 });
    }
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const parsed = PlanSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return Response.json({ error: "We could not read that file. Enter your counts below instead." }, { status: 422 });
    const p = parsed.data;
    const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));
    return Response.json({
      ...p,
      windows: clamp(p.windows, 400),
      entryDoors: clamp(p.entryDoors, 12),
      slidingDoors: clamp(p.slidingDoors, 60),
      curtainWallBays: clamp(p.curtainWallBays, 200),
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "Busy right now. Try again in a minute, or enter your counts below." }, { status: 429 });
    if (err instanceof Anthropic.APIError) return Response.json({ error: "We could not read that file. Enter your counts below instead." }, { status: 502 });
    if (err instanceof SyntaxError) return Response.json({ error: "We could not read that file. Enter your counts below instead." }, { status: 422 });
    throw err;
  }
}
