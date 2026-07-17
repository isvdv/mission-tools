import { Activity, Bot, Radio, Server } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { requireWebAuth } from '../../lib/server';
import { fetchCurrentAccount, fetchManageableGuilds, avatarUrl } from '../../lib/discord';
import { logService } from '../../../src/services/logService';

export default async function DashboardPage() {
  const auth = await requireWebAuth();
  const [account, guilds, logs] = await Promise.all([
    fetchCurrentAccount(auth.token),
    fetchManageableGuilds(auth.token),
    logService.list(5)
  ]);

  const stats = [
    { label: 'Status do bot', value: 'online', icon: Bot },
    { label: 'Servidores gerenciaveis', value: String(guilds.length), icon: Server },
    { label: 'Modulos', value: '6', icon: Activity },
    { label: 'Sistema de voz', value: 'pronto', icon: Radio }
  ];

  return (
    <div className="grid gap-6">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={avatarUrl(account)} alt="" className="h-14 w-14 rounded-lg border border-white/10" />
          <div>
            <p className="text-sm text-slate-400">Conta autenticada</p>
            <h2 className="text-2xl font-semibold">{account.global_name ?? account.username}</h2>
            <p className="text-sm text-slate-500">{account.id}</p>
          </div>
        </div>
        <Button href="/dashboard/mission">Ir para missoes</Button>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <stat.icon className="mb-3 h-5 w-5 text-cyanSoft" />
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Acesso rapido</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button href="/dashboard/voice" variant="secondary">Sessao de Voz</Button>
            <Button href="/dashboard/presence" variant="secondary">Rich Presence</Button>
            <Button href="/dashboard/clean" variant="secondary">Sistema de Limpeza</Button>
            <Button href="/dashboard/username-checker" variant="secondary">Verificar Usernames</Button>
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Acoes recentes</h3>
          <div className="grid gap-3">
            {logs.length ? logs.map((log) => (
              <div key={log.id} className="rounded-lg bg-ink/60 p-3 text-sm">
                <p className="font-medium">{log.module} / {log.action}</p>
                <p className="text-slate-400">{log.message}</p>
              </div>
            )) : <p className="text-sm text-slate-400">Nenhuma acao registrada ainda.</p>}
          </div>
        </Card>
      </section>
    </div>
  );
}
