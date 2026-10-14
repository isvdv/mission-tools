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
        title="Sessão de voz"
        description="Conecte a conta autenticada a um canal de voz usando o ID do servidor e do canal."
      />
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusIndicator status={status.status} />
        <p className="text-sm text-[var(--text-secondary)]"><strong className="font-semibold text-[var(--text-primary)]">{guilds.length}</strong> {guilds.length === 1 ? 'servidor gerenciável' : 'servidores gerenciáveis'}</p>
      </Card>
      <ModuleActionPanel kind="voice" />
    </div>
  );
}
