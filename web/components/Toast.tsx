'use client';

export function Toast({ message, tone = 'neutral' }: { message: string; tone?: 'neutral' | 'error' | 'success' }) {
  const colors = {
    neutral: 'border-white/10 bg-panel text-white',
    error: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
    success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm shadow-glow ${colors[tone]}`}>{message}</div>;
}
