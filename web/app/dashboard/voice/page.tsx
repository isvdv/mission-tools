import { Card } from '../../../components/Card';
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
      <Card>
        <h2 className="text-2xl font-semibold">Sessao de Voz</h2>
        <p className="mt-2 text-slate-300">Conecte a conta autenticada a um canal de voz usando o ID do servidor e do canal.</p>
      </Card>
      <Card>
        <StatusIndicator status={status.status} />
        <p className="mt-3 text-sm text-slate-400">Servidores gerenciaveis carregados: {guilds.length}</p>
      </Card>
      <ModuleActionPanel kind="voice" />
    </div>
  );
}
