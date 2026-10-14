'use client';

import { useMemo, useState } from 'react';
import { ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Field } from '../../../components/Field';
import { Input, Textarea } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { Toast } from '../../../components/Toast';
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
    details: 'Managing missions',
    ...initialStatus.config
  });
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const previewType = activityLabels[config.activityType ?? 0] ?? 'Jogando';
  const startedAt = useMemo(() => {
    if (!config.startTimestamp) return 'now';
    const date = new Date(config.startTimestamp);
    return Number.isNaN(date.getTime()) ? config.startTimestamp : date.toLocaleString('pt-BR');
  }, [config.startTimestamp]);

  function update<K extends keyof PresenceConfig>(key: K, value: PresenceConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value || undefined }));
  }

  async function applyPresence() {
    setMessage('Aplicando presenca...');
    setTone('neutral');
    const response = await apiRequest<{ status: PresenceStatus }>('/api/presence/update', {
      method: 'POST',
      body: JSON.stringify(config)
    });

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
    setMessage('Parando presenca...');
    setTone('neutral');
    const response = await apiRequest<{ status: PresenceStatus }>('/api/presence/stop', {
      method: 'POST'
    });
    setTone(response.success ? 'success' : 'error');
    setMessage(response.success ? response.message : `${response.message} ${response.error ?? ''}`);
    if (response.success) setStatus(response.data.status.status);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="grid gap-5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <p className="mb-2 font-mono text-xs uppercase text-[var(--text-primary)]">PRESENCE_PREVIEW</p>
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
                  <span className="font-mono text-xs text-[var(--text-muted)]">S</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-[var(--accent)]">{previewType}</p>
              <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{config.name || 'Atividade personalizada'}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{config.details || 'Nenhum detalhe configurado'}</p>
              <p className="text-sm text-[var(--text-muted)]">{config.state || 'Nenhum estado configurado'}</p>
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">START: {startedAt}</p>
              {config.buttonLabel && config.buttonUrl ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {config.buttonLabel}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {message ? <Toast message={message} tone={tone} /> : null}
      </Card>

      <Card className="grid gap-5">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="font-mono text-xs uppercase text-[var(--text-primary)]">PRESENCE_CONFIG</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Dados enviados para o modulo de Rich Presence.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Activity Name" htmlFor="rich-name">
            <Input id="rich-name" placeholder="Mission Tools" value={config.name ?? ''} onChange={(event) => update('name', event.target.value)} />
          </Field>
          <Field label="Activity Type" htmlFor="rich-type">
            <Select id="rich-type" value={String(config.activityType ?? 0)} onChange={(event) => update('activityType', Number(event.target.value) as 0 | 1 | 2 | 3 | 5)}>
              <option value="0">Jogando</option>
              <option value="1">Transmitindo</option>
              <option value="2">Ouvindo</option>
              <option value="3">Assistindo</option>
              <option value="5">Competindo</option>
            </Select>
          </Field>
        </div>

        <Field label="Details" htmlFor="rich-details">
          <Textarea id="rich-details" placeholder="Managing missions" value={config.details ?? ''} onChange={(event) => update('details', event.target.value)} />
        </Field>
        <Field label="State" htmlFor="rich-state">
          <Textarea id="rich-state" placeholder="Queue monitoring" value={config.state ?? ''} onChange={(event) => update('state', event.target.value)} />
        </Field>
        <Field label="Description" htmlFor="rich-description">
          <Input id="rich-description" placeholder="Painel Mission Tools" value={config.description ?? ''} onChange={(event) => update('description', event.target.value)} />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Application ID" htmlFor="rich-app-id">
            <Input id="rich-app-id" placeholder="123456789012345678" value={config.applicationId ?? ''} onChange={(event) => update('applicationId', event.target.value)} />
          </Field>
          <Field label="Start Timestamp" htmlFor="rich-start">
            <Input id="rich-start" placeholder="2026-08-21T12:00:00.000Z" value={config.startTimestamp ?? ''} onChange={(event) => update('startTimestamp', event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Large Image" htmlFor="rich-large-image">
            <Input id="rich-large-image" placeholder="asset_key or https://..." value={config.largeImage ?? ''} onChange={(event) => update('largeImage', event.target.value)} />
          </Field>
          <Field label="Large Text" htmlFor="rich-large-text">
            <Input id="rich-large-text" placeholder="Mission module" value={config.largeText ?? ''} onChange={(event) => update('largeText', event.target.value)} />
          </Field>
          <Field label="Small Image" htmlFor="rich-small-image">
            <Input id="rich-small-image" placeholder="asset_key or https://..." value={config.smallImage ?? ''} onChange={(event) => update('smallImage', event.target.value)} />
          </Field>
          <Field label="Small Text" htmlFor="rich-small-text">
            <Input id="rich-small-text" placeholder="Online" value={config.smallText ?? ''} onChange={(event) => update('smallText', event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Button Label" htmlFor="rich-button-label">
            <Input id="rich-button-label" placeholder="Open panel" value={config.buttonLabel ?? ''} onChange={(event) => update('buttonLabel', event.target.value)} />
          </Field>
          <Field label="Button URL" htmlFor="rich-button-url">
            <Input id="rich-button-url" placeholder="https://..." value={config.buttonUrl ?? ''} onChange={(event) => update('buttonUrl', event.target.value)} />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          <Button onClick={applyPresence}>APPLY PRESENCE</Button>
          <Button variant="secondary" onClick={stopPresence}>STOP PRESENCE</Button>
        </div>
      </Card>
    </div>
  );
}
