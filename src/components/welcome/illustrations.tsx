// Flat, friendly inline illustrations. Colors come from theme tokens via currentColor / CSS vars.

export function SearchIllustration() {
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true" className="h-full w-full">
      <rect x="20" y="30" width="160" height="34" rx="17" fill="var(--card)" stroke="var(--border)" />
      <circle cx="42" cy="47" r="7" fill="none" stroke="var(--teal)" strokeWidth="3" />
      <path d="M47 52l5 5" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
      <rect x="60" y="43" width="70" height="8" rx="4" fill="var(--ice)" />
      <rect x="30" y="76" width="64" height="24" rx="12" fill="var(--mint)" />
      <rect x="100" y="76" width="70" height="24" rx="12" fill="var(--ice)" />
      <text x="62" y="92" textAnchor="middle" fontSize="10" fill="var(--navy)" fontWeight="600">Headache</text>
      <text x="135" y="92" textAnchor="middle" fontSize="10" fill="var(--navy)" fontWeight="600">baş ağrısı</text>
      <path d="M150 112c6-8 18-8 24 0" stroke="var(--aqua)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ConversationIllustration() {
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true" className="h-full w-full">
      {/* provider */}
      <circle cx="55" cy="62" r="16" fill="var(--amber)" opacity="0.9" />
      <path d="M30 120c0-18 11-30 25-30s25 12 25 30" fill="var(--teal)" />
      <path d="M47 100v14M63 100v14" stroke="var(--card)" strokeWidth="2" />
      {/* patient */}
      <circle cx="145" cy="62" r="16" fill="var(--coral)" opacity="0.85" />
      <path d="M131 52c4-10 24-10 28 0v-6c-6-10-22-10-28 0z" fill="var(--navy)" />
      <path d="M120 120c0-18 11-30 25-30s25 12 25 30" fill="var(--aqua)" />
      {/* bubbles */}
      <rect x="62" y="14" width="56" height="24" rx="12" fill="var(--ice)" />
      <text x="90" y="30" textAnchor="middle" fontSize="10" fill="var(--navy)" fontWeight="600">Bonjour</text>
      <rect x="96" y="40" width="60" height="22" rx="11" fill="var(--mint)" />
      <text x="126" y="55" textAnchor="middle" fontSize="10" fill="var(--navy)" fontWeight="600">مرحبا</text>
    </svg>
  );
}

export function HandoverIllustration() {
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true" className="h-full w-full">
      <rect x="50" y="18" width="100" height="110" rx="12" fill="var(--card)" stroke="var(--border)" />
      <rect x="64" y="32" width="50" height="8" rx="4" fill="var(--teal)" />
      {[52, 66, 80].map((y) => <rect key={y} x="64" y={y} width="72" height="6" rx="3" fill="var(--ice)" />)}
      <path d="M64 100h20l6-10 8 20 6-10h28" stroke="var(--coral)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="150" cy="30" r="14" fill="var(--aqua)" />
      <path d="M144 30l4 4 8-8" stroke="var(--card)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -left-24 top-10 size-96 rounded-full bg-aqua/25 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-[28rem] rounded-full bg-teal/40 blur-3xl" />
      <div className="absolute inset-0 dots text-primary-foreground/10" />
      <span className="absolute left-[8%] top-[18%] size-6 animate-float rounded-full border-2 border-aqua/40" />
      <span className="absolute left-[46%] top-[12%] size-5 animate-float rounded-md border-2 border-primary-foreground/20 [animation-delay:1.5s]" />
      <span className="absolute bottom-[14%] left-[38%] animate-float font-display text-3xl font-bold text-amber/40 [animation-delay:2.5s]">+</span>
      <svg viewBox="0 0 40 20" className="absolute bottom-[22%] left-[6%] w-14 animate-float text-mint/30 [animation-delay:3s]" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 18a18 16 0 0 1 36 0" /></svg>
    </div>
  );
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block h-16 w-full ${className}`}>
      <path d="M0 40c240 40 480 40 720 10s480-30 720 10v20H0z" fill="currentColor" />
    </svg>
  );
}
