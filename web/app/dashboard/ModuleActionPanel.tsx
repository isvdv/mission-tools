'use client';

import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input, Textarea } from '../../components/Input';
import { Select } from '../../components/Select';
import { Toast } from '../../components/Toast';
import { apiRequest } from '../../lib/api';

type ModuleKind = 'mission' | 'clean' | 'voice' | 'presence' | 'delete-dm';

export function ModuleActionPanel({ kind }: { kind: ModuleKind }) {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error' | 'neutral'>('neutral');
  const [guildId, setGuildId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [presenceName, setPresenceName] = useState('Mission Tools');
  const [presenceDetails, setPresenceDetails] = useState('Managing missions');
  const [activityType, setActivityType] = useState('0');

  async function call(path: string, body: Record<string, unknown> = {}) {
    setMessage('Executando...');
    setTone('neutral');
    const result = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setTone(result.success ? 'success' : 'error');
    setMessage(result.message);
  }

  return (
    <Card className="grid gap-4">
      {kind === 'voice' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="ID do servidor" value={guildId} onChange={(event) => setGuildId(event.target.value)} />
          <Input placeholder="ID do canal de voz" value={channelId} onChange={(event) => setChannelId(event.target.value)} />
        </div>
      ) : null}

      {kind === 'clean' ? (
        <Input placeholder="ID do usuario alvo opcional" value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} />
      ) : null}

      {kind === 'presence' ? (
        <div className="grid gap-3">
          <Input placeholder="Nome da atividade" value={presenceName} onChange={(event) => setPresenceName(event.target.value)} />
          <Textarea placeholder="Detalhes" value={presenceDetails} onChange={(event) => setPresenceDetails(event.target.value)} />
          <Select value={activityType} onChange={(event) => setActivityType(event.target.value)}>
            <option value="0">Jogando</option>
            <option value="1">Transmitindo</option>
            <option value="2">Ouvindo</option>
            <option value="3">Assistindo</option>
            <option value="5">Competindo</option>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {kind === 'mission' ? (
          <>
            <Button onClick={() => call('/api/mission/start')}>Iniciar missao</Button>
            <Button variant="secondary" onClick={() => call('/api/mission/stop')}>Parar missao</Button>
          </>
        ) : null}

        {kind === 'clean' ? (
          <>
            <Button onClick={() => call('/api/clean/start', { targetUserId: targetUserId || undefined })}>Iniciar limpeza</Button>
            <Button variant="secondary" onClick={() => call('/api/clean/stop')}>Cancelar limpeza</Button>
          </>
        ) : null}

        {kind === 'voice' ? (
          <>
            <Button onClick={() => call('/api/voice/start', { guildId, channelId })}>Iniciar sessao</Button>
            <Button variant="secondary" onClick={() => call('/api/voice/stop')}>Parar sessao</Button>
          </>
        ) : null}

        {kind === 'presence' ? (
          <>
            <Button onClick={() => call('/api/presence/update', {
              name: presenceName,
              details: presenceDetails,
              activityType: Number(activityType)
            })}>Aplicar presenca</Button>
            <Button variant="secondary" onClick={() => call('/api/presence/stop')}>Parar presenca</Button>
          </>
        ) : null}

        {kind === 'delete-dm' ? (
          <Button variant="danger" onClick={() => call('/api/delete-dm/run')}>Executar limpeza da DM</Button>
        ) : null}
      </div>

      {message ? <Toast message={message} tone={tone} /> : null}
    </Card>
  );
}
