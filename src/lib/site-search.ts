// "Ask anything" smart search behind the FAQ (src/app/api/ask/route.ts).
// No AI and no external service: questions are matched against the site's own
// FAQs, product systems, projects and key pages, with synonyms so everyday
// wording ("hurricane", "color", "how many can I order") finds the right content.
// Server-only, so the product data never ships to the browser.

import { FAQS } from "@/lib/faqs";
import { PRODUCTS } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";

export type SearchLink = { title: string; meta: string; href: string };
export type SearchResult = { answer: string | null; links: SearchLink[] };

/* ── Synonyms: every word in a group counts as the same idea ──── */
const GROUPS: string[][] = [
  ["hurricane", "impact", "missile", "hvhz", "miami", "dade", "broward", "storm", "cyclone", "coastal", "coast", "wind"],
  ["colour", "color", "ral", "finish", "anodised", "anodized", "wood", "paint", "black", "white", "bronze", "grey", "gray", "coating"],
  ["price", "pricing", "cost", "quote", "estimate", "budget", "expensive", "cheap", "payment", "pay", "usd", "dollar"],
  ["ship", "shipping", "delivery", "deliver", "freight", "port", "transport", "export", "import"],
  ["customs", "clearance", "duty", "tariff"],
  ["certified", "certification", "certificate", "approval", "approved", "nami", "aama", "wdma", "csa", "astm", "florida", "code", "permit", "compliant", "tested", "test"],
  ["sliding", "slide", "slider", "patio", "lift", "glide"],
  ["door", "entrance", "entry", "front", "terrace"],
  ["window", "casement", "tilt", "turn", "awning", "hopper"],
  ["fixed", "picture"],
  ["facade", "curtain", "storefront", "cladding", "envelope"],
  ["thermal", "energy", "insulation", "insulated", "efficient", "efficiency", "passive", "ufactor", "heat", "cold"],
  ["sound", "acoustic", "noise", "quiet", "stc", "oitc"],
  ["warranty", "guarantee", "support", "service", "repair", "spare", "spares", "after"],
  ["aluminum", "aluminium", "metal"],
  ["pvc", "vinyl", "upvc", "plastic"],
  ["factory", "manufacture", "manufactured", "made", "produce", "production", "europe", "european", "bulgaria", "based", "located", "location", "headquarters"],
  ["minimum", "quantity", "many", "moq", "few"],
  ["buy", "purchase", "order", "dealer", "distributor", "supplier", "reseller", "sell", "shop", "store", "retailer", "direct"],
  ["pack", "packed", "packing", "packaging", "protect", "protected", "damage", "crate"],
  ["choose", "help", "recommend", "advice", "select", "specify"],
  ["size", "large", "big", "wide", "tall", "height", "width", "span", "opening", "dimension", "biggest", "largest"],
  ["glass", "glazing", "triple", "double", "laminated", "pane"],
  ["project", "reference", "portfolio", "built", "residence", "building", "multifamily"],
  ["contact", "call", "email", "phone", "talk", "meet", "consultation"],
  ["catalogue", "catalog", "brochure", "pdf", "download", "drawing", "cad", "document", "datasheet"],
  ["time", "lead", "long", "fast", "weeks", "schedule", "when"],
];

const STOP = new Set(
  "a an the and or of to in on for with do does did is are be can could i you we your our my me it its this that there what how who about from at by as if any have has will would should than then so just get which much offer need want like system systems product products rated rating usa us america american united states state where somewhere anywhere here please hello hi".split(" "),
);

const CONCEPT = new Map<string, string>();
GROUPS.forEach((g, i) => g.forEach((w) => CONCEPT.set(stem(w), `g${i}`)));
const concept = (w: string) => CONCEPT.get(stem(w))!;

// Questions about these topics are product questions, so product cards are relevant.
const PRODUCT_TOPICS = new Set(
  ["hurricane", "colour", "sliding", "door", "window", "fixed", "facade", "thermal", "sound", "aluminum", "pvc", "size", "glass"].map(concept),
);

function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Words → canonical terms (synonyms collapse to one concept). */
function terms(text: string): string[] {
  return words(text)
    .filter((w) => !STOP.has(w))
    .map((w) => CONCEPT.get(stem(w)) ?? stem(w));
}

/* ── Typo tolerance: unknown words snap to the closest known word ── */
const VOCAB = new Set<string>();

function distance(a: string, b: string): number {
  // Damerau-Levenshtein (optimal string alignment): swapped letters count as one edit.
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

function correct(w: string): string {
  if (w.length < 4 || VOCAB.has(w) || STOP.has(w) || CONCEPT.has(stem(w))) return w;
  const max = w.length >= 7 ? 2 : 1;
  let best = w;
  let bestD = max + 1;
  for (const v of VOCAB) {
    if (Math.abs(v.length - w.length) > max) continue;
    const dist = distance(w, v);
    if (dist < bestD) [best, bestD] = [v, dist];
  }
  return best;
}

/** Visitor question → terms, with typos corrected first. */
function queryTerms(text: string): string[] {
  return terms(words(text).map(correct).join(" "));
}

/* ── Index ───────────────────────────────────────────────────── */
type Doc = { kind: "faq" | "product" | "project" | "page"; title: string; meta: string; href: string; answer?: string; weights: Map<string, number> };

function doc(kind: Doc["kind"], title: string, body: string, rest: Omit<Doc, "kind" | "title" | "weights">): Doc {
  const weights = new Map<string, number>();
  const add = (text: string, w: number) => {
    words(text).forEach((x) => x.length >= 4 && VOCAB.add(x));
    for (const t of new Set(terms(text))) weights.set(t, Math.max(weights.get(t) ?? 0, w));
  };
  add(body, 1);
  add(title, 3);
  return { kind, title, weights, ...rest };
}

const PAGES = [
  { title: "Find your system", meta: "Answer four questions, get matched systems", href: "/products/finder", body: "choose right system recommend help which window door sliding hurricane impact project" },
  { title: "Ask for a colour match", meta: "Any RAL, anodised and wood-effect finishes, dual-colour too", href: "/contact", body: "colour ral finish anodised wood effect dual colour inside outside match custom" },
  { title: "Certifications", meta: "Approved for the USA, certificates on request", href: "/certifications", body: "certified certification approval florida hvhz nami aama wdma csa astm code permit" },
  { title: "Catalogue", meta: "Browse the full catalogue online", href: "/catalogue", body: "catalogue brochure pdf range products" },
  { title: "Downloads", meta: "Technical documents per system", href: "/downloads", body: "download drawing cad document datasheet technical pack" },
  { title: "Projects", meta: "Multifamily, residential and institutional work", href: "/projects", body: "project reference portfolio built buildings" },
  { title: "About VALDA", meta: "Family-owned since 1998, made in-house", href: "/about", body: "about company family factory manufacture made europe bulgaria history" },
  { title: "Contact our team", meta: "Quotes, drawings and 30-minute calls", href: "/contact", body: "contact call email phone talk quote price lead time consultation order buy" },
];

// Extra answers for common questions not on the FAQ page. Facts only from the site's own copy.
const INTENTS = [
  {
    q: "How do I order? Where can I buy from VALDA?",
    body: "buy purchase order dealer distributor direct quote",
    a: "Directly from us. VALDA sells factory direct, with no distributors or middlemen in between. Send your drawings or opening schedule through the contact page and we return a quote in USD, then manufacture and deliver to your site.",
  },
];

GROUPS.flat().forEach((w) => VOCAB.add(w));
STOP.forEach((w) => w.length >= 4 && VOCAB.add(w));

const INDEX: Doc[] = [
  ...INTENTS.map((f) => doc("faq", f.q, `${f.body} ${f.a}`, { meta: "FAQ", href: "/contact", answer: f.a })),
  ...FAQS.map((f) => doc("faq", f.q, f.a, { meta: "FAQ", href: "/faq", answer: f.a })),
  ...PRODUCTS.map((p) =>
    doc(
      "product",
      p.name,
      [p.brand, p.category, p.certification, p.impact ?? "non-impact", p.hvhz ? "hvhz hurricane" : "", p.impact ? "impact" : "", p.summary.soundStcOitc ? "sound" : "", p.summary.uFactor ? "thermal" : "", p.summary.largestOpening ? "large" : "", p.openingTypes.join(" "), p.copy.headline, p.copy.paragraph, p.copy.points.join(" ")].join(" "),
      { meta: [p.brand, p.category, p.impact ? "Impact rated" : "", p.summary.designPressure ? (/^up to/i.test(p.summary.designPressure) ? p.summary.designPressure : `up to ${p.summary.designPressure}`) : ""].filter(Boolean).join(" · "), href: `/products/system/${p.slug}` },
    ),
  ),
  ...PROJECTS.map((p) => doc("project", p.name, `${p.location} ${p.market} ${p.systems} ${p.summary}`, { meta: `${p.location} · ${p.market}`, href: `/projects/${p.slug}` })),
  ...PAGES.map((p) => doc("page", p.title, p.body, { meta: p.meta, href: p.href })),
];

// "Project" words should lead to real projects, not to FAQs or products that say "your project".
const PROJECT = CONCEPT.get("project")!;
INDEX.forEach((d) => (d.kind === "faq" || d.kind === "product") && d.weights.delete(PROJECT));

/* ── Search ──────────────────────────────────────────────────── */
// score = summed weight of matched terms (title words count 3x);
// coverage = share of the question's terms the item matches.
function rank(d: Doc, q: string[]) {
  let s = 0;
  let hit = 0;
  for (const t of q) {
    const w = d.weights.get(t) ?? 0;
    s += w;
    if (w) hit++;
  }
  return { d, s, cov: hit / q.length };
}

const CAP = { product: 3, project: 2, page: 2 } as const;

export function searchSite(question: string): SearchResult {
  const q = [...new Set(queryTerms(question))];
  if (!q.length) return { answer: null, links: [] };

  const ranked = INDEX.map((d) => rank(d, q))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.cov - a.cov || b.s - a.s);

  // A written FAQ answer only when it clearly matches: most of the question, including a title word.
  const faq = ranked.find((r) => r.d.kind === "faq" && r.cov >= 0.5 && r.s >= 3);
  const answer = faq?.d.answer ?? null;

  const links: SearchLink[] = [];
  const wants = {
    product: q.some((t) => PRODUCT_TOPICS.has(t)),
    project: q.includes(PROJECT),
    page: true,
  };
  for (const kind of ["product", "project", "page"] as const) {
    ranked
      // Products and projects only when the question is about them, or names one (title match).
      .filter((r) => r.d.kind === kind && r.cov >= 0.5 && (wants[kind] || r.s >= 3))
      .slice(0, CAP[kind])
      .forEach((r) => links.push({ title: r.d.title, meta: r.d.meta, href: r.d.href }));
  }
  return { answer, links: links.slice(0, 5) };
}
