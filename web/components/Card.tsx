import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-glow backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
