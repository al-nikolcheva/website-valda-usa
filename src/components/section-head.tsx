// Shared numbered section header, Scandiwest style:
// [label ................................ /NN]
// [Headline]
// [intro]
export function SectionHead({
  n,
  label,
  title,
  intro,
  dark = false,
}: {
  n: string;
  label: string;
  title: React.ReactNode;
  intro?: string;
  dark?: boolean;
}) {
  const meta = dark ? "text-white/55" : "text-mute";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-6">
        <p className={`text-[14px] leading-[22px] ${meta}`}>{label}</p>
        <p className={`text-[14px] leading-[22px] ${meta}`}>/{n}</p>
      </div>
      <h2 className={`sw-h mt-8 max-w-3xl text-[clamp(2.2rem,4.4vw,3.5rem)] ${dark ? "text-white" : "text-char"}`}>
        {title}
      </h2>
      {intro && <p className={`mt-6 max-w-xl text-[16px] leading-6 ${dark ? "text-white/70" : "text-slate"}`}>{intro}</p>}
    </div>
  );
}
