import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components/PageHeader';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { requireWebAuth } from '../../../lib/server';
import { cleanService } from '../../../../src/services/cleanService';
import { ModuleActionPanel } from '../ModuleActionPanel';

export default async function CleanPage() {
  const auth = await requireWebAuth();
  const status = cleanService.getStatus(auth.userId);
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Limpeza de DMs"
        description="Apague suas mensagens nas conversas privadas e acompanhe o andamento por aqui."
      />
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusIndicator status={status.state} />
        <p className="text-sm text-[var(--text-secondary)]">{status.message}</p>
      </Card>
      <ModuleActionPanel kind="clean" />
    </div>
  );
}
