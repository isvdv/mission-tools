import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/Table';
import { logService } from '../../../../src/services/logService';

export default async function LogsPage() {
  const logs = await logService.list(100);
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Logs</h2>
        <p className="mt-2 text-slate-300">Historico de acoes administrativas salvo pela API web.</p>
      </Card>
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
      />
    </div>
  );
}
