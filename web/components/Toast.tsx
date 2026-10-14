'use client';

export function Toast({ message, tone = 'neutral' }: { message: string; tone?: 'neutral' | 'error' | 'success' }) {
  const colors = {
    neutral: 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)]',
    error: 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]',
    success: 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
  };
  const labels = {
    neutral: 'INFO',
    error: 'ERROR',
    success: 'SUCCESS'
  };

  return (
    <div className={`rounded-[var(--radius-sm)] border px-4 py-3 text-sm shadow-none ${colors[tone]}`}>
      <span className="mr-2 font-mono text-xs text-[var(--text-muted)]">{labels[tone]}</span>
      {message}
    </div>
  );
}
