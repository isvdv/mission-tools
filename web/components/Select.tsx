import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-11 w-full rounded-lg border border-white/10 bg-ink/70 px-3 py-2 text-sm text-white outline-none ring-cyanSoft/30 transition focus:border-cyanSoft focus:ring-4 ${props.className ?? ''}`}
    />
  );
}
