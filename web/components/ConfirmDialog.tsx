'use client';

import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-300">{description}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  );
}
