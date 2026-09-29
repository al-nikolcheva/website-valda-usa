// Plain muted label (Scandiwest): no rules, no caps.
export function Marker({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return <p className={`text-[14px] leading-[22px] ${tone === "light" ? "text-white/60" : "text-mute"}`}>{children}</p>;
}

// Section header: [label ........ /NN] then the headline.
export function SectionHead({
  index,
  label,
  title,
  light = false,
  className = "",
}: {
  index?: string;
  label: string;
  title: string;
  light?: boolean;
  className?: string;
}) {
  const meta = light ? "text-white/55" : "text-mute";
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-6">
        <p className={`text-[14px] leading-[22px] ${meta}`}>{label}</p>
        {index && <p className={`text-[14px] leading-[22px] ${meta}`}>/{index}</p>}
      </div>
      <h2 className={`sw-h mt-8 max-w-3xl text-[clamp(2.2rem,4.4vw,3.5rem)] ${light ? "text-white" : "text-char"}`}>
        {title}
      </h2>
    </div>
  );
}
