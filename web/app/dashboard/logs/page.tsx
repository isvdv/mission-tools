import { Badge } from '../../../components/Badge';
import { PageHeader } from '../../../components/PageHeader';
import { Table } from '../../../components/Table';
import { logService } from '../../../../src/services/logService';
import { requireWebAuth } from '../../../lib/server';

export default async function LogsPage() {
  const auth = await requireWebAuth();
  const logs = await logService.list(auth.userId, 100);
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Logs"
        description="Historico administrativo das acoes executadas pelo painel e persistidas pela API web."
      />
      <Table
        headers={['Data', 'Usuario', 'Modulo', 'Acao', 'Resultado', 'Mensagem']}
        rows={logs.map((log) => [
          new Date(log.createdAt).toLocaleString('pt-BR'),
          log.userId,
          log.module,
          log.action,
          <Badge key={log.id} tone={log.result === 'success' ? 'good' : log.result === 'error' ? 'bad' : 'neutral'}>{log.result}</Badge>,
          log.error ?? log.message
        ])}
        emptyLabel="NO LOG RECORDS"
      />
    </div>
  );
}
