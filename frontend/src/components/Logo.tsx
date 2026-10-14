import { Link } from "react-router-dom";

/** ReSpark logo: a glowing spark inside a circular-reuse loop, drawn in SVG. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="ReSpark logo">
      <circle cx="24" cy="24" r="21" className="fill-brand-600" />
      {/* circular-reuse loop */}
      <path
        d="M38 24a14 14 0 1 1-6.2-11.6"
        stroke="#fef3c7"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M31.9 8.2l.6 5.4-5.3 1" stroke="#fef3c7" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* spark */}
      <path
        d="M24 13l1.9 6.6 6.6 1.9-6.6 1.9-1.9 6.6-1.9-6.6-6.6-1.9 6.6-1.9z"
        className="fill-spark-400"
        stroke="#b45309"
        strokeWidth="0.6"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="ReSpark home">
      <LogoMark size={compact ? 32 : 38} />
      {!compact && (
        <div className="leading-tight">
          <div className="text-lg font-bold tracking-tight text-stone-900">Re<span className="text-brand-600">Spark</span></div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-stone-400">Rediscover the value</div>
        </div>
      )}
    </Link>
  );
}
