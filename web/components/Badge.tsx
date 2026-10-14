export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones = {
    neutral: 'border-[var(--border-hover)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]',
    good: 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]',
    warn: 'border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]',
    bad: 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
