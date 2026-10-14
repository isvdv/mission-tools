import { AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components/PageHeader';
import { ModuleActionPanel } from '../ModuleActionPanel';

export default function DeleteDmPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Apagar DM do Bot"
        description="Gerencie a limpeza de mensagens enviadas pelo bot na DM."
      />
      <Card>
        <AlertTriangle className="mb-3 h-5 w-5 text-[var(--warning)]" />
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Esta limpeza depende da sessao ativa do bot no Discord. Use o painel por DM enquanto a conexao direta com o app desktop nao estiver disponivel.
        </p>
      </Card>
      <ModuleActionPanel kind="delete-dm" />
    </div>
  );
}
