import type { ReactNode } from 'react';

export function Card({ children, className = '', padding = true }: { children: ReactNode; className?: string; padding?: boolean }) {
  return (
    <section className={`technical-panel rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] ${padding ? 'p-5' : ''} shadow-none ${className}`}>
      {children}
    </section>
  );
}
