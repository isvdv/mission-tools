'use client';

import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Field } from '../../components/Field';
import { Input } from '../../components/Input';
import { PanelHeader } from '../../components/PanelHeader';
import { Toast } from '../../components/Toast';
import { apiRequest } from '../../lib/api';

type ModuleKind = 'clean' | 'voice';

const descriptions: Record<ModuleKind, string> = {
  voice: 'Informe o servidor e o canal de voz para conectar a conta.',
  clean: 'Apaga suas mensagens nas DMs e desfaz amizades. Informe um ID para limpar só uma conversa, ou deixe em branco para limpar todas.'
};

const ID_PATTERN = '[0-9]{15,21}';

type PendingConfirm = { path: string; body?: Record<string, unknown>; title: string; description: string; confirmLabel: string };

export function ModuleActionPanel({ kind }: { kind: ModuleKind }) {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error' | 'neutral'>('neutral');
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [guildId, setGuildId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  async function call(path: string, body: Record<string, unknown> = {}) {
    if (pendingPath) return;
    setPendingPath(path);
    setMessage('');
    const result = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setTone(result.success ? 'success' : 'error');
    setMessage(result.success ? result.message : [result.message, result.error].filter(Boolean).join(' '));
    setPendingPath(null);
  }

  const busy = pendingPath !== null;
  const voiceReady = guildId.trim() !== '' && channelId.trim() !== '';

  return (
    <Card className="grid gap-5">
      <PanelHeader title="Ações" description={descriptions[kind]} />

      {kind === 'voice' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="ID do servidor" htmlFor="voice-guild-id">
            <Input id="voice-guild-id" inputMode="numeric" pattern={ID_PATTERN} autoComplete="off" className="font-mono" placeholder="123456789012345678" value={guildId} onChange={(event) => setGuildId(event.target.value)} />
          </Field>
          <Field label="ID do canal de voz" htmlFor="voice-channel-id">
            <Input id="voice-channel-id" inputMode="numeric" pattern={ID_PATTERN} autoComplete="off" className="font-mono" placeholder="123456789012345678" value={channelId} onChange={(event) => setChannelId(event.target.value)} />
          </Field>
        </div>
      ) : null}

      {kind === 'clean' ? (
        <Field label="ID do usuário" htmlFor="clean-target-user" description="Opcional">
          <Input id="clean-target-user" inputMode="numeric" pattern={ID_PATTERN} autoComplete="off" className="font-mono" placeholder="123456789012345678" value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} />
        </Field>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        {kind === 'clean' ? (
          <>
            <Button
              loading={pendingPath === '/api/clean/start'}
              disabled={busy}
              onClick={() => setConfirm({
                path: '/api/clean/start',
                body: { targetUserId: targetUserId.trim() || undefined },
                title: 'Iniciar limpeza?',
                description: targetUserId.trim()
                  ? `Suas mensagens na DM com o usuário ${targetUserId.trim()} serão apagadas e a amizade com ele será desfeita. Isso não pode ser desfeito.`
                  : 'Suas mensagens em todas as DMs serão apagadas e todas as amizades fora da lista de exceções serão desfeitas. Isso não pode ser desfeito.',
                confirmLabel: 'Iniciar limpeza'
              })}
            >
              Iniciar limpeza
            </Button>
            <Button variant="secondary" loading={pendingPath === '/api/clean/stop'} disabled={busy} onClick={() => call('/api/clean/stop')}>Cancelar limpeza</Button>
          </>
        ) : null}

        {kind === 'voice' ? (
          <>
            <Button loading={pendingPath === '/api/voice/start'} disabled={busy || !voiceReady} onClick={() => call('/api/voice/start', { guildId: guildId.trim(), channelId: channelId.trim() })}>Conectar</Button>
            <Button variant="secondary" loading={pendingPath === '/api/voice/stop'} disabled={busy} onClick={() => call('/api/voice/stop')}>Desconectar</Button>
          </>
        ) : null}

      </div>

      <div aria-live="polite">{message ? <Toast message={message} tone={tone} /> : null}</div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.confirmLabel}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          setConfirm(null);
          void call(confirm.path, confirm.body);
        }}
      />
    </Card>
  );
}
