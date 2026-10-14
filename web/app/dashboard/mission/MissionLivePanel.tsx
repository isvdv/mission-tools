'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ProgressBar } from '../../../components/ProgressBar';
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
  active?: boolean;
};

type AvailableMission = {
  id: string;
  name: string;
  gameName: string;
  gameIconUrl?: string;
  largeImage?: string;
  reward: string;
  taskType?: string;
  duration: number;
  progress: number;
  available: boolean;
  unavailableReason?: string;
  enrolled: boolean;
};

const taskLabels: Record<string, string> = {
  WATCH_VIDEO: 'Assistir video',
  WATCH_VIDEO_ON_MOBILE: 'Assistir video mobile',
  PLAY_ON_DESKTOP: 'Jogar no desktop',
  STREAM_ON_DESKTOP: 'Transmitir no desktop',
  PLAY_ACTIVITY: 'Jogar atividade'
};

export function MissionLivePanel({
  initialStatus,
  initialAvailableMissions,
  initialCatalogError = ''
}: {
  initialStatus: MissionStatus;
  initialAvailableMissions: AvailableMission[];
  initialCatalogError?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [missions, setMissions] = useState(initialAvailableMissions);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [catalogError, setCatalogError] = useState(initialCatalogError);
  const [refreshError, setRefreshError] = useState('');
  const [pending, setPending] = useState(false);
  const actionPending = useRef(false);
  const requestVersion = useRef(0);
  const refreshController = useRef<AbortController | null>(null);
  const lastCatalogRefresh = useRef(0);

  const refresh = useCallback(async (includeMissions = true) => {
    if (actionPending.current) return;
    const version = ++requestVersion.current;
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    const response = await apiRequest<{
      status: MissionStatus;
      availableMissions?: AvailableMission[] | null;
      availableMissionsError?: string | null;
    }>(`/api/mission/status?includeMissions=${includeMissions ? '1' : '0'}`, { signal: controller.signal });

    if (controller.signal.aborted || version !== requestVersion.current) return;

    if (response.success) {
      setStatus(response.data.status);
      setRefreshError('');
      if (includeMissions) {
        lastCatalogRefresh.current = Date.now();
        setCatalogError(response.data.availableMissionsError ?? '');
        if (response.data.availableMissions) setMissions(response.data.availableMissions);
      }
    } else {
      setRefreshError(response.message);
    }
  }, []);

  async function call(path: string, body?: Record<string, unknown>) {
    if (actionPending.current) return;
    actionPending.current = true;
    setPending(true);
    requestVersion.current++;
    refreshController.current?.abort();
    setMessage('Executando...');
    setTone('neutral');
    const response = await apiRequest<{ status: MissionStatus }>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.success) setStatus(response.data.status);
    setTone(response.success ? 'success' : 'error');
    setMessage(response.success ? response.message : `${response.message} ${response.error ?? ''}`);
    actionPending.current = false;
    setPending(false);
    await refresh();
  }

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polling = false;
    async function poll() {
      if (polling) return;
      polling = true;
      clearTimeout(timer);
      try {
        await refresh(Date.now() - lastCatalogRefresh.current >= 30000);
      } finally {
        polling = false;
      }
      // Hidden tabs stop polling; visibilitychange resumes with a fresh read.
      if (!disposed && !document.hidden) timer = setTimeout(poll, 3000);
    }
    function onVisibilityChange() {
      if (!document.hidden) void poll();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    void poll();
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      refreshController.current?.abort();
    };
  }, [refresh]);

  const progress = Math.max(0, Math.min(100, Math.round(status.progress ?? 0)));
  const active = status.active ?? ['Running', 'Stopping'].includes(status.state);

  return (
    <div className="grid gap-6">
      {refreshError ? <div role="alert"><Toast tone="error" message={`Atualizacao interrompida: ${refreshError}`} /><Button variant="secondary" onClick={() => refresh()}>Tentar novamente</Button></div> : null}
      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-mono text-xs uppercase text-[var(--text-primary)]">LIVE_MISSION</h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            UPDATED: {new Date(status.updatedAt).toLocaleTimeString('pt-BR')}
          </span>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div>
              <StatusIndicator status={status.state} />
            </div>
            <div className="mt-4 flex items-center gap-4">
              {status.gameIconUrl ? (
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-black">
                  <img src={status.gameIconUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div>
                <p className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                  {status.currentMission ?? 'Nenhuma missao em execucao'}
                </p>
                <p className="font-mono text-xs text-[var(--accent)]">
                  {status.gameName ?? 'Jogo ainda nao identificado'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {status.detail ?? 'Aguardando inicio pelo painel web.'}
            </p>
            <div className="mt-4 grid gap-2 font-mono text-xs text-[var(--text-muted)] sm:grid-cols-2">
              <span>REWARD: {status.reward ?? 'N/A'}</span>
              <span>QUEUE: {status.totalMissions !== undefined ? `${status.currentIndex ?? 0}/${status.totalMissions}` : 'IDLE'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={pending || active} onClick={() => call('/api/mission/start')}>Iniciar fila</Button>
            <Button disabled={pending || !active || status.state === 'Stopping'} variant="secondary" onClick={() => call('/api/mission/stop')}>{status.state === 'Stopping' ? 'Parando...' : 'Parar missao'}</Button>
          </div>
        </div>

        <div className="border-t border-[var(--border)] p-5">
          <ProgressBar label="MISSION_PROGRESS" value={progress} />
        </div>

        {message ? <div aria-live="polite" className="px-5 pb-5"><Toast tone={tone} message={message} /></div> : null}
      </Card>

      <Card padding={false}>
        {catalogError ? <div role="alert" className="p-4"><Toast tone="error" message={catalogError} /><Button variant="secondary" onClick={() => refresh()}>Atualizar lista</Button></div> : null}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-mono text-xs uppercase text-[var(--text-primary)]">MISSOES DISPONIVEIS PARA FAZER</h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">{missions.length} RECORDS</span>
        </div>

        {missions.length ? (
          <div className="grid gap-3 p-4 xl:grid-cols-2 2xl:grid-cols-3">
            {missions.map((mission) => (
              <div key={mission.id} className="grid gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-black/30 p-4 transition duration-150 hover:border-[var(--border-hover)]">
                <div className="flex items-start gap-3">
                  {mission.gameIconUrl || mission.largeImage ? (
                    <img
                      src={mission.gameIconUrl || mission.largeImage}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-black font-mono text-[10px] text-[var(--text-muted)]">
                      QUEST
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{mission.name}</p>
                        <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{mission.gameName}</p>
                      </div>
                      <Badge tone={mission.available ? 'good' : 'warn'}>
                        {mission.available ? 'Disponivel' : 'Limitado'}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-1 font-mono text-[11px] text-[var(--text-muted)]">
                      <span>ID: {mission.id}</span>
                      <span>TASK: {mission.taskType ? taskLabels[mission.taskType] ?? mission.taskType : 'Unknown'}</span>
                      <span>REWARD: {mission.reward}</span>
                    </div>
                  </div>
                </div>

                <ProgressBar label="MISSION_PROGRESS" value={mission.progress} />

                {mission.unavailableReason ? (
                  <p className="text-xs leading-5 text-[var(--warning)]">{mission.unavailableReason}</p>
                ) : null}

                <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {mission.enrolled ? 'ENROLLED' : 'NOT_ENROLLED'}
                  </span>
                  <Button
                    onClick={() => call('/api/mission/start', { missionId: mission.id })}
                    disabled={!mission.available || pending || active}
                    className="min-h-9"
                  >
                    Iniciar esta missao
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title={catalogError ? 'Lista indisponivel' : 'Nenhuma missao disponivel'} description={catalogError ? 'Use Atualizar lista para tentar novamente.' : 'Nenhuma missao valida foi encontrada para este usuario.'} />
          </div>
        )}
      </Card>
    </div>
  );
}
