'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

// Native <dialog> gives focus trapping, Esc to close and inert background for free.
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
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="w-[calc(100%-2rem)] max-w-lg rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text-primary)] backdrop:bg-black/70"
    >
      {open ? (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" onClick={onClose} aria-label="Fechar" className="min-h-8 w-8 px-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
