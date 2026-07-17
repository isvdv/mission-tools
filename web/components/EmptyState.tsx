import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-slate-300">
      <Inbox className="mx-auto mb-3 h-8 w-8 text-cyanSoft" />
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
