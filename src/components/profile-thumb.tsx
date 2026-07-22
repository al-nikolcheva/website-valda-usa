/**
 * Compact, static profile cross-section used as a card thumbnail.
 * Aluminium shows a polyamide thermal break; PVC shows steel reinforcement.
 */
export function ProfileThumb({ material, className = "" }: { material: "Aluminium" | "PVC"; className?: string }) {
  const alu = material === "Aluminium";
  return (
    <svg viewBox="0 0 200 180" className={className} role="img" aria-label={`${material} profile section`}>
      <defs>
        <linearGradient id="pt-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8dce2" />
          <stop offset="1" stopColor="#9aa1ab" />
        </linearGradient>
        <linearGradient id="pt-metal2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcc2ca" />
          <stop offset="1" stopColor="#868d97" />
        </linearGradient>
        <linearGradient id="pt-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f93c8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2f4f86" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* insulated glass unit */}
      <rect x="20" y="40" width="9" height="100" fill="url(#pt-glass)" stroke="#9fb8de" strokeWidth="1.2" />
      <rect x="33" y="40" width="9" height="100" fill="url(#pt-glass)" stroke="#9fb8de" strokeWidth="1.2" />
      {/* warm-edge spacer */}
      <rect x="20" y="126" width="22" height="14" rx="2" fill="#7c828c" />

      {/* gasket */}
      <path d="M46 78 h12 v24 h-12 z" fill="#14181d" />

      {/* multi-chamber frame */}
      <rect x="58" y="34" width="118" height="112" rx="7" fill="url(#pt-metal)" stroke="#5f6671" strokeWidth="2" />
      <g stroke="#6b727c" strokeWidth="1.5" fill="url(#pt-metal2)">
        <rect x="70" y="46" width="44" height="38" rx="3" />
        <rect x="122" y="46" width="42" height="38" rx="3" />
        <rect x="70" y="96" width="44" height="38" rx="3" />
        <rect x="122" y="96" width="42" height="38" rx="3" />
      </g>

      {/* core: thermal break (aluminium) or steel reinforcement (PVC) */}
      {alu ? (
        <>
          <rect x="58" y="84" width="118" height="12" fill="#1b2026" />
          <g stroke="#3a6dba" strokeOpacity="0.55" strokeWidth="1.6">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={64 + i * 13} y1="84" x2={58 + i * 13} y2="96" />
            ))}
          </g>
        </>
      ) : (
        <>
          <rect x="80" y="54" width="26" height="22" rx="2" fill="#5b6470" stroke="#2c333d" strokeWidth="2.5" />
          <rect x="130" y="54" width="22" height="22" rx="2" fill="#5b6470" stroke="#2c333d" strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}
