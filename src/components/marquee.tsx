/**
 * Seamless infinite marquee. Children are rendered twice; each direct child
 * should carry its own right margin + `shrink-0` so the loop is gapless.
 * Pauses on hover. Edge fade masks keep the ends soft.
 */
export function Marquee({
  children,
  durationSec = 32,
  className = "",
  fade = true,
}: {
  children: React.ReactNode;
  durationSec?: number;
  className?: string;
  fade?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </div>
      {fade && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--marquee-fade,#fff)] to-transparent md:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--marquee-fade,#fff)] to-transparent md:w-28" />
        </>
      )}
    </div>
  );
}
