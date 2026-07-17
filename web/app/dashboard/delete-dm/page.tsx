import { AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/Card';
import { ModuleActionPanel } from '../ModuleActionPanel';

export default function DeleteDmPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Apagar DM do Bot</h2>
        <p className="mt-2 text-slate-300">Gerencie a limpeza de mensagens enviadas pelo bot na DM.</p>
      </Card>
      <Card>
        <AlertTriangle className="mb-3 h-6 w-6 text-amber-300" />
        <p className="text-sm text-slate-300">
          TODO: esta acao precisa acessar o client ativo do bot para listar e apagar mensagens do painel. A rota da API ja existe e registra logs, mas a ponte com o bot em execucao ainda precisa ser conectada.
        </p>
      </Card>
      <ModuleActionPanel kind="delete-dm" />
    </div>
  );
}
