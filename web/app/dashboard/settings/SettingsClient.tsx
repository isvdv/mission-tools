'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Field } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { PanelHeader } from '../../../components/PanelHeader';
import { Toast } from '../../../components/Toast';
import { apiRequest } from '../../../lib/api';

export function SettingsClient({ initial }: { initial: { defaultGuildId?: string; defaultVoiceChannelId?: string; webhookUrl?: string } }) {
  const [defaultGuildId, setDefaultGuildId] = useState(initial.defaultGuildId ?? '');
  const [defaultVoiceChannelId, setDefaultVoiceChannelId] = useState(initial.defaultVoiceChannelId ?? '');
  const [webhookUrl, setWebhookUrl] = useState(initial.webhookUrl ?? '');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error'>('success');
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const response = await apiRequest('/api/settings/update', {
      method: 'POST',
      body: JSON.stringify({ defaultGuildId, defaultVoiceChannelId, webhookUrl })
    });
    setTone(response.success ? 'success' : 'error');
    setMessage(response.success ? response.message : [response.message, response.error].filter(Boolean).join(' '));
    setSaving(false);
  }

  return (
    <Card>
      <form className="grid gap-5" onSubmit={save}>
      <PanelHeader title="Padrões" description="Valores preenchidos automaticamente nas ferramentas do painel." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Servidor padrão (ID)" htmlFor="settings-guild-id">
          <Input id="settings-guild-id" inputMode="numeric" autoComplete="off" className="font-mono" placeholder="123456789012345678" value={defaultGuildId} onChange={(event) => setDefaultGuildId(event.target.value)} />
        </Field>
        <Field label="Canal de voz padrão (ID)" htmlFor="settings-voice-channel">
          <Input id="settings-voice-channel" inputMode="numeric" autoComplete="off" className="font-mono" placeholder="123456789012345678" value={defaultVoiceChannelId} onChange={(event) => setDefaultVoiceChannelId(event.target.value)} />
        </Field>
      </div>
      <Field label="URL do webhook" htmlFor="settings-webhook" description="Opcional">
        <Input id="settings-webhook" type="url" autoComplete="off" placeholder="https://discord.com/api/webhooks/..." value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
      </Field>
      <div className="border-t border-[var(--border)] pt-4">
        <Button type="submit" loading={saving}>Salvar configurações</Button>
      </div>
      <div aria-live="polite">{message ? <Toast message={message} tone={tone} /> : null}</div>
      </form>
    </Card>
  );
}
