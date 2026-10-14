import { Badge } from '../../../components/Badge';
import { PageHeader } from '../../../components/PageHeader';
import { Table } from '../../../components/Table';
import { logService } from '../../../../src/services/logService';
import { requireWebAuth } from '../../../lib/server';

const resultLabels: Record<string, string> = { success: 'Sucesso', error: 'Erro', info: 'Info' };

export default async function LogsPage() {
  const auth = await requireWebAuth();
  const logs = await logService.list(auth.userId, 100);
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Registros"
        description="Histórico das ações que você executou pelo painel."
      />
      <Table
        headers={['Data', 'Módulo', 'Ação', 'Resultado', 'Mensagem']}
        rows={logs.map((log) => [
          <time key={`${log.id}-time`} dateTime={log.createdAt} className="whitespace-nowrap text-[var(--text-secondary)]">{new Date(log.createdAt).toLocaleString('pt-BR')}</time>,
          log.module,
          log.action,
          <Badge key={log.id} tone={log.result === 'success' ? 'good' : log.result === 'error' ? 'bad' : 'neutral'}>{resultLabels[log.result] ?? log.result}</Badge>,
          log.error ?? log.message
        ])}
        emptyLabel="Nenhuma ação registrada ainda."
      />
    </div>
  );
}
