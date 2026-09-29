import { SITE } from "@/lib/site";

// Contact form delivery. Sends the enquiry by email through Resend's REST API when
// RESEND_API_KEY is set (add it in the hosting environment). Without a key it answers
// 503, and the form falls back to opening the visitor's email app, so no lead is lost.
//   RESEND_API_KEY   required to send
//   CONTACT_TO       inbox that receives enquiries (default: the site email)
//   CONTACT_FROM     verified sender, e.g. "VALDA website <website@valdagroup.com>"

const FIELDS = ["name", "company", "email", "phone", "type", "material", "location", "timeline", "details"] as const;
type Enquiry = Record<(typeof FIELDS)[number], string>;

const LABELS: Record<(typeof FIELDS)[number], string> = {
  name: "Name",
  company: "Company",
  email: "Email",
  phone: "Phone",
  type: "Project type",
  material: "Material",
  location: "Project location",
  timeline: "Timeline",
  details: "Project details",
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const e = Object.fromEntries(
    FIELDS.map((k) => [k, typeof body[k] === "string" ? (body[k] as string).trim().slice(0, k === "details" ? 5000 : 200) : ""]),
  ) as Enquiry;
  if (!e.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) {
    return Response.json({ error: "Please add your name and a valid email." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "Email delivery is not configured.", fallback: true }, { status: 503 });

  const rows = FIELDS.filter((k) => e[k]);
  const text = rows.map((k) => `${LABELS[k]}: ${e[k]}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .map((k) => `<tr><td style="color:#6f6f72;vertical-align:top">${LABELS[k]}</td><td>${esc(e[k]).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? `VALDA website <website@${SITE.domain}>`,
      to: [process.env.CONTACT_TO ?? SITE.email],
      reply_to: e.email,
      subject: `New enquiry: ${e.name}${e.company ? `, ${e.company}` : ""}${e.type ? ` (${e.type})` : ""}`,
      text,
      html,
    }),
  });

  if (!res.ok) return Response.json({ error: "Could not send right now.", fallback: true }, { status: 502 });
  return Response.json({ ok: true });
}
