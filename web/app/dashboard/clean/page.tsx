import { Card } from '../../../components/Card';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { requireWebAuth } from '../../../lib/server';
import { cleanService } from '../../../../src/services/cleanService';
import { ModuleActionPanel } from '../ModuleActionPanel';

export default async function CleanPage() {
  const auth = await requireWebAuth();
  const status = cleanService.getStatus(auth.userId);
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Sistema de Limpeza</h2>
        <p className="mt-2 text-slate-300">Execute tarefas de limpeza de DM usando os controles desta pagina.</p>
      </Card>
      <Card>
        <StatusIndicator status={status.state} />
        <p className="mt-3 text-sm text-slate-400">{status.message}</p>
      </Card>
      <ModuleActionPanel kind="clean" />
    </div>
  );
}
