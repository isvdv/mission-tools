export function StatusIndicator({ status }: { status: string }) {
  const isGood = ['active', 'running', 'connected', 'completed', 'online'].includes(status.toLowerCase());
  const isBad = ['error', 'failed'].includes(status.toLowerCase());
  const color = isGood ? 'bg-emerald-400' : isBad ? 'bg-rose-400' : 'bg-amber-300';
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
    stopped: 'parado'
  };
  const label = labels[status.toLowerCase()] ?? status;
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-200">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
