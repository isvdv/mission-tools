import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--border-hover)] bg-black/30 p-6 text-center text-[var(--text-secondary)]">
      <Inbox className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
      <p className="font-mono text-xs uppercase text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}
