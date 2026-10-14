'use client';

import { useMemo, useState } from 'react';
import { ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Field } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { Toast } from '../../../components/Toast';
import { PanelHeader } from '../../../components/PanelHeader';
import { apiRequest } from '../../../lib/api';

type PresenceConfig = {
  applicationId?: string;
  activityType?: 0 | 1 | 2 | 3 | 5;
  name?: string;
  description?: string;
  details?: string;
  state?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  startTimestamp?: string;
};

type PresenceStatus = {
  status: 'active' | 'inactive';
  config: PresenceConfig;
  updatedAt: string;
};

const activityLabels: Record<number, string> = {
  0: 'Jogando',
  1: 'Transmitindo',
  2: 'Ouvindo',
  3: 'Assistindo',
  5: 'Competindo'
};

export function PresenceEditor({ initialStatus }: { initialStatus: PresenceStatus }) {
  const [status, setStatus] = useState(initialStatus.status);
  const [config, setConfig] = useState<PresenceConfig>({
    activityType: 0,
    name: 'Mission Tools',
    details: 'Gerenciando missões',
    ...initialStatus.config
  });
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [pendingAction, setPendingAction] = useState<'apply' | 'stop' | null>(null);

  const previewType = activityLabels[config.activityType ?? 0] ?? 'Jogando';
  const startedAt = useMemo(() => {
    if (!config.startTimestamp) return 'agora';
    const date = new Date(config.startTimestamp);
    return Number.isNaN(date.getTime()) ? config.startTimestamp : date.toLocaleString('pt-BR');
  }, [config.startTimestamp]);

  function update<K extends keyof PresenceConfig>(key: K, value: PresenceConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value || undefined }));
  }

  async function applyPresence() {
    setPendingAction('apply');
    setMessage('');
    const response = await apiRequest<{ status: PresenceStatus }>('/api/presence/update', {
      method: 'POST',
      body: JSON.stringify(config)
    });
    setPendingAction(null);

    if (response.success) {
      setStatus(response.data.status.status);
      setTone('success');
      setMessage(response.message);
      return;
    }

    setTone('error');
    setMessage(`${response.message} ${response.error ?? ''}`);
  }

  async function stopPresence() {
    setPendingAction('stop');
    setMessage('');
    const response = await apiRequest<{ status: PresenceStatus }>('/api/presence/stop', {
      method: 'POST'
    });
    setPendingAction(null);
    setTone(response.success ? 'success' : 'error');
    setMessage(response.success ? response.message : `${response.message} ${response.error ?? ''}`);
    if (response.success) setStatus(response.data.status.status);
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="grid gap-5 xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">Pré-visualização</h3>
            <StatusIndicator status={status} />
          </div>
          <Badge tone={status === 'active' ? 'good' : 'warn'}>{previewType}</Badge>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-black p-4">
          <div className="flex gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)]">
              {config.largeImage ? (
                <img src={config.largeImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--text-muted)]">
                  <ImageIcon className="h-7 w-7" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]">
                {config.smallImage ? (
                  <img src={config.smallImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="h-4 w-4 text-[var(--text-muted)]" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--accent)]">{previewType}</p>
              <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{config.name || 'Atividade personalizada'}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{config.details || 'Nenhum detalhe configurado'}</p>
              <p className="text-sm text-[var(--text-muted)]">{config.state || 'Nenhum estado configurado'}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Início: {startedAt}</p>
              {config.buttonLabel && config.buttonUrl ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {config.buttonLabel}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div aria-live="polite">{message ? <Toast message={message} tone={tone} /> : null}</div>
      </Card>

      <Card className="grid gap-5">
        <PanelHeader title="Atividade" description="O que aparece no seu perfil do Discord enquanto a presença estiver ativa." />

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome da atividade" htmlFor="rich-name">
            <Input id="rich-name" placeholder="Mission Tools" value={config.name ?? ''} onChange={(event) => update('name', event.target.value)} />
          </Field>
          <Field label="Tipo" htmlFor="rich-type">
            <Select id="rich-type" value={String(config.activityType ?? 0)} onChange={(event) => update('activityType', Number(event.target.value) as 0 | 1 | 2 | 3 | 5)}>
              <option value="0">Jogando</option>
              <option value="1">Transmitindo</option>
              <option value="2">Ouvindo</option>
              <option value="3">Assistindo</option>
              <option value="5">Competindo</option>
            </Select>
          </Field>
        </div>

        <Field label="Detalhes" htmlFor="rich-details" description="1ª linha">
          <Input id="rich-details" maxLength={128} placeholder="Gerenciando missões" value={config.details ?? ''} onChange={(event) => update('details', event.target.value)} />
        </Field>
        <Field label="Estado" htmlFor="rich-state" description="2ª linha">
          <Input id="rich-state" maxLength={128} placeholder="Monitorando a fila" value={config.state ?? ''} onChange={(event) => update('state', event.target.value)} />
        </Field>
        <Field label="Descrição" htmlFor="rich-description">
          <Input id="rich-description" placeholder="Painel Mission Tools" value={config.description ?? ''} onChange={(event) => update('description', event.target.value)} />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="ID do aplicativo" htmlFor="rich-app-id">
            <Input id="rich-app-id" inputMode="numeric" autoComplete="off" className="font-mono" placeholder="123456789012345678" value={config.applicationId ?? ''} onChange={(event) => update('applicationId', event.target.value)} />
          </Field>
          <Field label="Horário de início" htmlFor="rich-start" description="ISO 8601">
            <Input id="rich-start" className="font-mono" placeholder="2026-08-21T12:00:00.000Z" value={config.startTimestamp ?? ''} onChange={(event) => update('startTimestamp', event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Imagem grande" htmlFor="rich-large-image">
            <Input id="rich-large-image" placeholder="chave do asset ou https://…" value={config.largeImage ?? ''} onChange={(event) => update('largeImage', event.target.value)} />
          </Field>
          <Field label="Texto da imagem grande" htmlFor="rich-large-text">
            <Input id="rich-large-text" placeholder="Módulo de missões" value={config.largeText ?? ''} onChange={(event) => update('largeText', event.target.value)} />
          </Field>
          <Field label="Imagem pequena" htmlFor="rich-small-image">
            <Input id="rich-small-image" placeholder="chave do asset ou https://…" value={config.smallImage ?? ''} onChange={(event) => update('smallImage', event.target.value)} />
          </Field>
          <Field label="Texto da imagem pequena" htmlFor="rich-small-text">
            <Input id="rich-small-text" placeholder="Online" value={config.smallText ?? ''} onChange={(event) => update('smallText', event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Texto do botão" htmlFor="rich-button-label">
            <Input id="rich-button-label" placeholder="Abrir painel" value={config.buttonLabel ?? ''} onChange={(event) => update('buttonLabel', event.target.value)} />
          </Field>
          <Field label="Link do botão" htmlFor="rich-button-url">
            <Input id="rich-button-url" type="url" placeholder="https://..." value={config.buttonUrl ?? ''} onChange={(event) => update('buttonUrl', event.target.value)} />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          <Button onClick={applyPresence} loading={pendingAction === 'apply'} disabled={pendingAction !== null}>Aplicar presença</Button>
          <Button variant="secondary" onClick={stopPresence} loading={pendingAction === 'stop'} disabled={pendingAction !== null || status !== 'active'}>Parar presença</Button>
        </div>
      </Card>
    </div>
  );
}
