export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones = {
    neutral: 'border-[var(--border-hover)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
    good: 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]',
    warn: 'border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]',
    bad: 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
  };
  return <span className={`inline-flex items-center rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase ${tones[tone]}`}>{children}</span>;
}
