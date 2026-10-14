export function ProgressBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{normalized}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
        className="h-2 overflow-hidden rounded-full bg-black/60"
      >
        <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}
