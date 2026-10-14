import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components/PageHeader';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { requireWebAuth } from '../../../lib/server';
import { fetchManageableGuilds } from '../../../lib/discord';
import { voiceService } from '../../../../src/services/voiceService';
import { ModuleActionPanel } from '../ModuleActionPanel';

export default async function VoicePage() {
  const auth = await requireWebAuth();
  const [status, guilds] = await Promise.all([
    Promise.resolve(voiceService.getStatus(auth.userId)),
    fetchManageableGuilds(auth.token)
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Sessao de Voz"
        description="Conecte a conta autenticada a um canal de voz usando o ID do servidor e do canal."
      />
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusIndicator status={status.status} />
        <p className="font-mono text-xs text-[var(--text-muted)]">MANAGEABLE_GUILDS: {guilds.length}</p>
      </Card>
      <ModuleActionPanel kind="voice" />
    </div>
  );
}
