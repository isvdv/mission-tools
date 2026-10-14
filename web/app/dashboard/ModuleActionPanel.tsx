'use client';

import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
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
    <Card className="grid gap-5">
      <div className="border-b border-[var(--border)] pb-3">
        <h3 className="font-mono text-xs uppercase text-[var(--text-primary)]">COMMAND_PANEL</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Execute comandos do modulo atual e acompanhe a resposta da API.</p>
      </div>

      {kind === 'voice' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Guild ID" htmlFor="voice-guild-id">
            <Input id="voice-guild-id" placeholder="123456789012345678" value={guildId} onChange={(event) => setGuildId(event.target.value)} />
          </Field>
          <Field label="Voice Channel ID" htmlFor="voice-channel-id">
            <Input id="voice-channel-id" placeholder="123456789012345678" value={channelId} onChange={(event) => setChannelId(event.target.value)} />
          </Field>
        </div>
      ) : null}

      {kind === 'clean' ? (
        <Field label="Target User ID" htmlFor="clean-target-user" description="optional">
          <Input id="clean-target-user" placeholder="123456789012345678" value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} />
        </Field>
      ) : null}

      {kind === 'presence' ? (
        <div className="grid gap-3">
          <Field label="Activity Name" htmlFor="presence-name">
            <Input id="presence-name" placeholder="Mission Tools" value={presenceName} onChange={(event) => setPresenceName(event.target.value)} />
          </Field>
          <Field label="Details" htmlFor="presence-details">
            <Textarea id="presence-details" placeholder="Managing missions" value={presenceDetails} onChange={(event) => setPresenceDetails(event.target.value)} />
          </Field>
          <Field label="Activity Type" htmlFor="presence-type">
            <Select id="presence-type" value={activityType} onChange={(event) => setActivityType(event.target.value)}>
              <option value="0">Jogando</option>
              <option value="1">Transmitindo</option>
              <option value="2">Ouvindo</option>
              <option value="3">Assistindo</option>
              <option value="5">Competindo</option>
            </Select>
          </Field>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        {kind === 'mission' ? (
          <>
            <Button onClick={() => call('/api/mission/start')}>RUN MISSION</Button>
            <Button variant="secondary" onClick={() => call('/api/mission/stop')}>STOP MISSION</Button>
          </>
        ) : null}

        {kind === 'clean' ? (
          <>
            <Button onClick={() => call('/api/clean/start', { targetUserId: targetUserId || undefined })}>START CLEAN</Button>
            <Button variant="secondary" onClick={() => call('/api/clean/stop')}>CANCEL CLEAN</Button>
          </>
        ) : null}

        {kind === 'voice' ? (
          <>
            <Button onClick={() => call('/api/voice/start', { guildId, channelId })}>CONNECT</Button>
            <Button variant="secondary" onClick={() => call('/api/voice/stop')}>DISCONNECT</Button>
          </>
        ) : null}

        {kind === 'presence' ? (
          <>
            <Button onClick={() => call('/api/presence/update', {
              name: presenceName,
              details: presenceDetails,
              activityType: Number(activityType)
            })}>APPLY PRESENCE</Button>
            <Button variant="secondary" onClick={() => call('/api/presence/stop')}>STOP PRESENCE</Button>
          </>
        ) : null}

        {kind === 'delete-dm' ? (
          <Button variant="danger" onClick={() => call('/api/delete-dm/run')}>EXECUTE DM PURGE</Button>
        ) : null}
      </div>

      {message ? <Toast message={message} tone={tone} /> : null}
    </Card>
  );
}
