/**
 * Full-bleed brand film cover. Plays continuously — muted, looping autoplay —
 * as a cinematic interlude. A soft vignette gives it depth.
 */
export function VideoSection() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <video
        src="/media/valda-film.mp4"
        poster="/images/valda-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* a bit of shadow — top/bottom gradient + inner vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-ink/55" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_200px_50px_rgba(0,0,0,0.55)]" />

      {/* caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-12">
        <p className="caption text-white/75 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
          <span className="text-blue-bright">/</span> Watch the film
        </p>
        <h2 className="mt-2 headline text-[clamp(2rem,5vw,4rem)] leading-[1.02] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.55)]">
          VALDA, in motion.
        </h2>
      </div>
    </section>
  );
}
