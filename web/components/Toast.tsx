'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type ToastTone = 'neutral' | 'error' | 'success';

const colors: Record<ToastTone, string> = {
  neutral: 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)]',
  error: 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--text-primary)]',
  success: 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--text-primary)]'
};

const icons: Record<ToastTone, { icon: typeof Info; color: string }> = {
  neutral: { icon: Info, color: 'text-[var(--accent)]' },
  error: { icon: AlertCircle, color: 'text-[var(--danger)]' },
  success: { icon: CheckCircle2, color: 'text-[var(--success)]' }
};

export function Toast({ message, tone = 'neutral', action }: { message: string; tone?: ToastTone; action?: ReactNode }) {
  const { icon: Icon, color } = icons[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-sm)] border px-4 py-3 text-sm ${colors[tone]}`}
    >
      <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${color}`} />
      <p className="min-w-0 flex-1 leading-6">{message}</p>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
