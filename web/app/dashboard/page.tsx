import { ArrowUpRight, ListChecks, Server, History } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { ToolDirectory } from '../../components/ToolDirectory';
import { requireWebAuth } from '../../lib/server';
import { fetchCurrentAccount, fetchManageableGuilds, avatarUrl } from '../../lib/discord';
import { logService } from '../../../src/services/logService';

export default async function DashboardPage() {
  const auth = await requireWebAuth();
  const [account, guilds, logs] = await Promise.all([fetchCurrentAccount(auth.token), fetchManageableGuilds(auth.token), logService.list(auth.userId, 5)]);
  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Seu espaço de trabalho" title="Visão geral" description="Escolha uma ferramenta e acompanhe o que acontece na sua conta."><Button href="/dashboard/mission"><ListChecks className="h-4 w-4" />Abrir missões</Button></PageHeader>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card padding={false} className="overflow-hidden"><div className="border-b border-[var(--border)] px-6 py-5"><h3 className="font-semibold">Ferramentas</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Um acesso direto ao que você precisa fazer.</p></div><ToolDirectory /></Card>
        <div className="grid min-w-0 gap-6">
          <Card><p className="mb-4 text-sm text-[var(--text-secondary)]">Conta conectada</p><div className="flex items-center gap-4"><img src={avatarUrl(account)} alt="" className="h-12 w-12 rounded-full object-cover" /><div className="min-w-0"><h3 className="truncate text-xl font-semibold">{account.global_name ?? account.username}</h3><p className="truncate text-sm text-[var(--text-secondary)]">@{account.username}</p></div></div>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-secondary)]"><Server className="h-4 w-4" /><span><strong className="text-[var(--text-primary)]">{guilds.length}</strong> servidores gerenciáveis</span><Button href="/dashboard/settings" variant="ghost" className="ml-auto" aria-label="Configurações da conta"><ArrowUpRight className="h-4 w-4" /></Button></div>
          </Card>
          <Card padding={false} className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-4"><h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-[var(--text-muted)]" />Atividade recente</h3><Button href="/dashboard/logs" variant="ghost">Ver registros</Button></div>
            <div className="divide-y divide-[var(--border)]">{logs.length ? logs.map((log) => (
              <div key={log.id} className="px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-[var(--accent)]">{log.module} / {log.action}</span><time className="text-[var(--text-muted)]" dateTime={new Date(log.createdAt).toISOString()}>{new Date(log.createdAt).toLocaleString('pt-BR')}</time></div><p className="mt-2 break-words text-sm leading-6 text-[var(--text-secondary)]">{log.message}</p></div>
            )) : <div className="px-6 py-10"><p className="text-sm font-medium">Tudo pronto para começar</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Ao usar uma ferramenta, os eventos registrados aparecerão aqui.</p></div>}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
