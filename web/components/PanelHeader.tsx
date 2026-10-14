import type { ReactNode } from 'react';

/** Section title inside a Card. `inset` adds padding for cards rendered with padding={false}. */
export function PanelHeader({
  title,
  description,
  meta,
  inset = false
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  inset?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-[var(--border)] ${inset ? 'px-5 py-4' : 'pb-4'}`}>
      <div className="min-w-0">
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p> : null}
      </div>
      {meta ? <div className="shrink-0 text-xs text-[var(--text-muted)]">{meta}</div> : null}
    </div>
  );
}
