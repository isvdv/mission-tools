'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
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
    <Card className="grid gap-4">
      <Input placeholder="ID do servidor padrao" value={defaultGuildId} onChange={(event) => setDefaultGuildId(event.target.value)} />
      <Input placeholder="ID do canal de voz padrao" value={defaultVoiceChannelId} onChange={(event) => setDefaultVoiceChannelId(event.target.value)} />
      <Input placeholder="Webhook URL" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
      <Button onClick={save}>Salvar configuracoes</Button>
      {message ? <Toast message={message} /> : null}
    </Card>
  );
}
