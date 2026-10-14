export function StatusIndicator({ status }: { status: string }) {
  const isGood = ['active', 'running', 'connected', 'completed', 'online'].includes(status.toLowerCase());
  const isBad = ['error', 'failed'].includes(status.toLowerCase());
  const color = isGood ? 'bg-[var(--success)]' : isBad ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]';
  const labels: Record<string, string> = {
    active: 'ativo',
    inactive: 'inativo',
    running: 'rodando',
    connected: 'conectado',
    disconnected: 'desconectado',
    reconnecting: 'reconectando',
    completed: 'concluido',
    waiting: 'aguardando',
    error: 'erro',
    failed: 'falhou',
    online: 'online',
    stopped: 'parado',
    stopping: 'parando'
  };
  const label = labels[status.toLowerCase()] ?? status;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase text-[var(--text-secondary)]">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}
