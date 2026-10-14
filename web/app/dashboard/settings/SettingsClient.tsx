'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Field } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { Toast } from '../../../components/Toast';
import { apiRequest } from '../../../lib/api';

export function SettingsClient({ initial }: { initial: { defaultGuildId?: string; defaultVoiceChannelId?: string; webhookUrl?: string } }) {
  const [defaultGuildId, setDefaultGuildId] = useState(initial.defaultGuildId ?? '');
  const [defaultVoiceChannelId, setDefaultVoiceChannelId] = useState(initial.defaultVoiceChannelId ?? '');
  const [webhookUrl, setWebhookUrl] = useState(initial.webhookUrl ?? '');
  const [message, setMessage] = useState('');

  async function save() {
    const response = await apiRequest('/api/settings/update', {
      method: 'POST',
      body: JSON.stringify({ defaultGuildId, defaultVoiceChannelId, webhookUrl })
    });
    setMessage(response.message);
  }

  return (
    <Card className="grid gap-5">
      <div className="border-b border-[var(--border)] pb-3">
        <h3 className="font-mono text-xs uppercase text-[var(--text-primary)]">CONFIG_STORE</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Valores usados como padrao pelos modulos do painel.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Default Guild ID" htmlFor="settings-guild-id">
          <Input id="settings-guild-id" placeholder="123456789012345678" value={defaultGuildId} onChange={(event) => setDefaultGuildId(event.target.value)} />
        </Field>
        <Field label="Default Voice Channel ID" htmlFor="settings-voice-channel">
          <Input id="settings-voice-channel" placeholder="123456789012345678" value={defaultVoiceChannelId} onChange={(event) => setDefaultVoiceChannelId(event.target.value)} />
        </Field>
      </div>
      <Field label="Webhook URL" htmlFor="settings-webhook">
        <Input id="settings-webhook" placeholder="https://discord.com/api/webhooks/..." value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
      </Field>
      <div className="border-t border-[var(--border)] pt-4">
        <Button onClick={save}>SAVE CONFIG</Button>
      </div>
      {message ? <Toast message={message} /> : null}
    </Card>
  );
}
