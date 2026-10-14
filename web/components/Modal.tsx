'use client';

import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="technical-panel w-full max-w-lg rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
          <h2 className="font-mono text-sm font-semibold uppercase text-[var(--text-primary)]">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar" className="min-h-8 w-8 px-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
