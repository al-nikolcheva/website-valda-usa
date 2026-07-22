import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Marquee } from "@/components/marquee";

type Quote = { quote: string; name: string; role: string };

const QUOTES: Quote[] = [
  { quote: "They didn't just supply windows — they engineered the whole envelope with us and stood behind the numbers.", name: "M. Reyes", role: "Principal Architect · Miami" },
  { quote: "Factory-direct pricing changed our pro forma. Same performance, no distributor markup, one point of contact.", name: "D. Whitfield", role: "Developer · Austin" },
  { quote: "The FL approvals were held in their own name, so permitting was clean. That saved us weeks.", name: "S. Novak", role: "Project Architect · Chicago" },
  { quote: "Slim sightlines, HVHZ rated, delivered on schedule across the Atlantic. Exactly what was promised.", name: "L. Bianchi", role: "Facade Consultant · New York" },
  { quote: "Every junction was detailed and sealed before fabrication. The install crew barely had a question.", name: "R. Adeyemi", role: "GC / Builder · Orlando" },
  { quote: "Genuinely the most responsive manufacturer we've worked with. Quotes back the next business day.", name: "K. Larsen", role: "Developer · Tampa" },
];

function initials(name: string) {
  return name.replace(/[^A-Za-z. ]/g, "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function Card({ q }: { q: Quote }) {
  return (
    <figure className="mr-6 flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-ink/10 bg-white p-7 md:w-[380px]">
      <blockquote className="text-[15px] leading-[1.7] text-ink">“{q.quote}”</blockquote>
      <figcaption className="mt-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 font-mono text-[12px] font-medium text-blue">
          {initials(q.name)}
        </span>
        <span>
          <span className="block text-[14px] font-medium text-ink">{q.name}</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-slate">{q.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ index }: { index?: string }) {
  return (
    <section className="bg-paper py-24 md:py-32 [--marquee-fade:var(--color-paper)]">
      <Container>
        <SectionHead index={index} label="What clients say" title="Architects & developers we build with." />
      </Container>
      <div className="mt-14">
        <Marquee durationSec={46}>
          {QUOTES.map((q) => (
            <Card key={q.name} q={q} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
