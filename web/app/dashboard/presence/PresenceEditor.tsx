'use client';

import { useMemo, useState } from 'react';
import { ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
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
        <div className="flex items-center justify-between gap-3">
          <StatusIndicator status={status} />
          <Badge tone={status === 'active' ? 'good' : 'warn'}>{previewType}</Badge>
        </div>

        <div className="rounded-lg border border-white/10 bg-ink/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Previa</p>
          <div className="flex gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
              {config.largeImage ? (
                <img src={config.largeImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-500">
                  <ImageIcon className="h-7 w-7" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-ink bg-panel">
                {config.smallImage ? (
                  <img src={config.smallImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-500">S</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{previewType}</p>
              <h3 className="truncate text-lg font-semibold">{config.name || 'Atividade personalizada'}</h3>
              <p className="mt-1 text-sm text-slate-300">{config.details || 'Nenhum detalhe configurado'}</p>
              <p className="text-sm text-slate-400">{config.state || 'Nenhum estado configurado'}</p>
              <p className="mt-2 text-xs text-slate-500">Inicio: {startedAt}</p>
              {config.buttonLabel && config.buttonUrl ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {config.buttonLabel}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {message ? <Toast message={message} tone={tone} /> : null}
      </Card>

      <Card className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Nome da atividade" value={config.name ?? ''} onChange={(event) => update('name', event.target.value)} />
          <Select value={String(config.activityType ?? 0)} onChange={(event) => update('activityType', Number(event.target.value) as 0 | 1 | 2 | 3 | 5)}>
            <option value="0">Jogando</option>
            <option value="1">Transmitindo</option>
            <option value="2">Ouvindo</option>
            <option value="3">Assistindo</option>
            <option value="5">Competindo</option>
          </Select>
        </div>

        <Textarea placeholder="Detalhes" value={config.details ?? ''} onChange={(event) => update('details', event.target.value)} />
        <Textarea placeholder="Estado" value={config.state ?? ''} onChange={(event) => update('state', event.target.value)} />
        <Input placeholder="Descricao" value={config.description ?? ''} onChange={(event) => update('description', event.target.value)} />

        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="ID da aplicacao" value={config.applicationId ?? ''} onChange={(event) => update('applicationId', event.target.value)} />
          <Input placeholder="Horario inicial ou data ISO" value={config.startTimestamp ?? ''} onChange={(event) => update('startTimestamp', event.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="URL ou asset da imagem grande" value={config.largeImage ?? ''} onChange={(event) => update('largeImage', event.target.value)} />
          <Input placeholder="Texto da imagem grande" value={config.largeText ?? ''} onChange={(event) => update('largeText', event.target.value)} />
          <Input placeholder="URL ou asset da imagem pequena" value={config.smallImage ?? ''} onChange={(event) => update('smallImage', event.target.value)} />
          <Input placeholder="Texto da imagem pequena" value={config.smallText ?? ''} onChange={(event) => update('smallText', event.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Texto do botao" value={config.buttonLabel ?? ''} onChange={(event) => update('buttonLabel', event.target.value)} />
          <Input placeholder="URL do botao" value={config.buttonUrl ?? ''} onChange={(event) => update('buttonUrl', event.target.value)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={applyPresence}>Aplicar presenca</Button>
          <Button variant="secondary" onClick={stopPresence}>Parar presenca</Button>
        </div>
      </Card>
    </div>
  );
}
