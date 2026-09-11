/**
 * The course mark: a speed gauge (speedometer) with its needle swung toward the
 * fast end — the universal "performance" motif. A bright Core Web Vitals green
 * dial (#0CCE6B) with a teal needle (#0E7490), matching the course palette.
 * Callers control size via `className`; the brand colours are fixed so the mark
 * looks consistent in both light and dark themes.
 */
export function WebPerformanceLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
    >
      {/* gauge dial (top semicircle) */}
      <path
        d="M4 16.5a8 8 0 0 1 16 0"
        stroke="#0cce6b"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* scale ticks */}
      <path
        d="M5.6 12.4l1.3.75M12 8.5v1.5M18.4 12.4l-1.3.75"
        stroke="#0cce6b"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* needle swung toward the fast end */}
      <path d="M12 16.5 16.8 10.4" stroke="#0e7490" strokeWidth="1.9" strokeLinecap="round" />
      {/* hub */}
      <circle cx="12" cy="16.5" r="1.6" fill="#0cce6b" />
    </svg>
  );
}
