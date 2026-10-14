import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Shows a spinner and blocks repeat clicks while a request is in flight. */
  loading?: boolean;
};

const styles = {
  primary: 'border-[var(--accent)] bg-[var(--accent)] text-black hover:bg-[#bdd2ff]',
  secondary: 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-raised)]',
  danger: 'border-[var(--danger)] bg-[var(--danger)] text-black hover:bg-[#ff8796]',
  ghost: 'border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
};

export function Button({ href, children, variant = 'primary', className = '', loading = false, ...props }: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} aria-label={props['aria-label']} title={props.title}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props} disabled={props.disabled || loading} aria-busy={loading || undefined}>
      {loading ? <LoadingSpinner /> : null}
      {children}
    </button>
  );
}
