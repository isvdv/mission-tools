import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--border-hover)] bg-black/20 px-6 py-8 text-center">
      <Inbox aria-hidden="true" className="mx-auto mb-3 h-6 w-6 text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
