'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { Toast } from '../../../components/Toast';
import { apiRequest } from '../../../lib/api';

type MissionStatus = {
  state: string;
  currentMission?: string;
  gameName?: string;
  gameIconUrl?: string;
  largeImage?: string;
  reward?: string;
  currentIndex?: number;
  totalMissions?: number;
  progress?: number;
  detail?: string;
  updatedAt: string;
};

type AvailableFunction = {
  name: string;
  description: string;
  available: boolean;
};

export function MissionLivePanel({ initialStatus }: { initialStatus: MissionStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [functions, setFunctions] = useState<AvailableFunction[]>([]);
  const [message, setMessage] = useState('');

  async function refresh() {
    const response = await apiRequest<{
      status: MissionStatus;
      availableFunctions: AvailableFunction[];
    }>('/api/mission/status');

    if (response.success) {
      setStatus(response.data.status);
      setFunctions(response.data.availableFunctions);
    }
  }

  async function call(path: string) {
    setMessage('Executando...');
    const response = await apiRequest(path, { method: 'POST' });
    setMessage(response.success ? response.message : `${response.message} ${response.error ?? ''}`);
    await refresh();
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const progress = Math.max(0, Math.min(100, Math.round(status.progress ?? 0)));

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Missao atual</h3>
            <div className="mt-3">
              <StatusIndicator status={status.state} />
            </div>
            <div className="mt-4 flex items-center gap-4">
              {status.gameIconUrl ? (
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/10">
                  <img src={status.gameIconUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div>
                <p className="text-2xl font-semibold">
                  {status.currentMission ?? 'Nenhuma missao em execucao'}
                </p>
                <p className="text-sm text-cyanSoft">
                  {status.gameName ?? 'Jogo ainda nao identificado'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {status.detail ?? 'Aguardando inicio pelo painel web.'}
            </p>
            {status.reward ? (
              <p className="mt-2 text-sm text-slate-500">Recompensa: {status.reward}</p>
            ) : null}
            {status.totalMissions !== undefined ? (
              <p className="mt-2 text-sm text-slate-500">
                Missao {status.currentIndex ?? 0} de {status.totalMissions}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => call('/api/mission/start')}>Iniciar missao</Button>
            <Button variant="secondary" onClick={() => call('/api/mission/stop')}>Parar missao</Button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-cyanSoft transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {message ? <div className="mt-4"><Toast message={message} /></div> : null}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Funcoes disponiveis para missoes</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {functions.map((item) => (
            <div key={item.name} className="rounded-lg border border-white/10 bg-ink/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{item.name}</p>
                <Badge tone={item.available ? 'good' : 'warn'}>
                  {item.available ? 'Disponivel' : 'Limitado'}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
