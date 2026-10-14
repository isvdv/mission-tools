import type { ReactNode } from 'react';

export function Field({
  label,
  htmlFor,
  description,
  children
}: {
  label: string;
  htmlFor?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
        {description ? <span className="text-xs text-[var(--text-muted)]">{description}</span> : null}
      </div>
      {children}
    </div>
  );
}
