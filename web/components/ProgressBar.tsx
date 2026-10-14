export function ProgressBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 font-mono text-xs text-[var(--text-secondary)]">
        <span>{label}</span>
        <span>{normalized}%</span>
      </div>
      <div className="h-2 border border-[var(--border)] bg-black">
        <div className="h-full bg-[var(--accent)] transition-[width] duration-200" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}
