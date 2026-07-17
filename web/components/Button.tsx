import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

const styles = {
  primary: 'bg-cyanSoft text-ink hover:bg-white',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-400',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/10'
};

export function Button({ href, children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
