import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/60 px-3 py-2 text-base text-[var(--text-primary)] outline-none transition duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${props.className ?? ''}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/60 px-3 py-2 text-base text-[var(--text-primary)] outline-none transition duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${props.className ?? ''}`}
    />
  );
}
