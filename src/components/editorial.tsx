export function Marker({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  const sub = tone === "light" ? "text-white/65" : "text-slate";
  const line = tone === "light" ? "bg-white/50" : "bg-slate/50";
  return (
    <p className={`flex items-center gap-3 caption ${sub}`}>
      <span className={`h-px w-7 ${line}`} />
      {children}
    </p>
  );
}

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
  return (
    <div className={className}>
      <p className={`caption ${light ? "text-white/70" : "text-slate"}`}>
        <span className="text-blue-bright">/</span>{index ? ` ${index} — ` : " "}{label}
      </p>
      <h2 className={`mt-4 max-w-3xl headline text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
    </div>
  );
}
