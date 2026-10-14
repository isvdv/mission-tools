import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-black px-3 py-2 font-mono text-base text-[var(--text-primary)] outline-none transition duration-150 focus:border-[var(--accent)] sm:text-sm ${props.className ?? ''}`}
    />
  );
}
