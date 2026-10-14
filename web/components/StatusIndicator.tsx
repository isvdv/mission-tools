const labels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  idle: 'Parado',
  running: 'Em execução',
  connected: 'Conectado',
  connecting: 'Conectando',
  disconnected: 'Desconectado',
  reconnecting: 'Reconectando',
  completed: 'Concluído',
  waiting: 'Aguardando',
  error: 'Erro',
  failed: 'Falhou',
  online: 'Online',
  stopped: 'Parado',
  stopping: 'Parando'
};

const good = ['active', 'running', 'connected', 'completed', 'online'];
const bad = ['error', 'failed'];
const live = ['running', 'connecting', 'reconnecting', 'stopping'];

export function StatusIndicator({ status }: { status: string }) {
  const key = status.toLowerCase();
  const color = good.includes(key) ? 'bg-[var(--success)]' : bad.includes(key) ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]';
  const label = labels[key] ?? status;

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {live.includes(key) ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${color}`} /> : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      <span>{label}</span>
    </span>
  );
}
