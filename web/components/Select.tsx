import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/60 px-3 py-2 text-base text-[var(--text-primary)] outline-none transition duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${props.className ?? ''}`}
    />
  );
}
