'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { PanelHeader } from '../../../components/PanelHeader';
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
  orbs?: number;
  taskType?: string;
  duration: number;
  progress: number;
  available: boolean;
  unavailableReason?: string;
  enrolled: boolean;
};

const taskLabels: Record<string, string> = {
  WATCH_VIDEO: 'Assistir vídeo',
  WATCH_VIDEO_ON_MOBILE: 'Assistir vídeo no celular',
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
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
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
    setPendingAction(typeof body?.missionId === 'string' ? body.missionId : path);
    requestVersion.current++;
    refreshController.current?.abort();
    setMessage('');
    const response = await apiRequest<{ status: MissionStatus }>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.success) setStatus(response.data.status);
    setTone(response.success ? 'success' : 'error');
    setMessage(response.success ? response.message : `${response.message} ${response.error ?? ''}`);
    actionPending.current = false;
    setPending(false);
    setPendingAction(null);
    await refresh();
  }

  async function retry() {
    setRetrying(true);
    await refresh();
    setRetrying(false);
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

  const updatedAt = new Date(status.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const queueLabel = status.totalMissions !== undefined ? `${status.currentIndex ?? 0} de ${status.totalMissions}` : 'Nenhuma fila ativa';
  const stopping = status.state === 'Stopping';
  const orbMissions = missions.filter((mission) => mission.available && (mission.orbs ?? 0) > 0);
  const totalOrbs = orbMissions.reduce((sum, mission) => sum + (mission.orbs ?? 0), 0);

  return (
    <div className="grid gap-6">
      {refreshError ? (
        <Toast
          tone="error"
          message={`Não foi possível atualizar o status: ${refreshError}`}
          action={<Button variant="secondary" className="min-h-9" loading={retrying} onClick={retry}>Tentar novamente</Button>}
        />
      ) : null}

      <Card padding={false}>
        <PanelHeader
          inset
          title="Execução atual"
          meta={<span>Atualizado às <time dateTime={status.updatedAt} className="font-mono tabular-nums">{updatedAt}</time></span>}
        />

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <StatusIndicator status={status.state} />
            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/60 text-[var(--text-muted)]">
                {status.gameIconUrl ? <img src={status.gameIconUrl} alt="" className="h-full w-full object-cover" /> : <Gamepad2 aria-hidden="true" className="h-6 w-6" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                  {status.currentMission ?? 'Nenhuma missão em execução'}
                </p>
                <p className="truncate text-sm text-[var(--accent)]">
                  {status.gameName ?? 'Inicie a fila ou escolha uma missão abaixo.'}
                </p>
              </div>
            </div>
            {status.detail ? <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{status.detail}</p> : null}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] bg-black/25 px-3 py-2">
                <dt className="text-xs text-[var(--text-muted)]">Recompensa</dt>
                <dd className="mt-0.5 truncate text-[var(--text-primary)]">{status.reward ?? '—'}</dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-black/25 px-3 py-2">
                <dt className="text-xs text-[var(--text-muted)]">Fila</dt>
                <dd className="mt-0.5 text-[var(--text-primary)]">{queueLabel}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={pending || active} loading={pendingAction === '/api/mission/start'} onClick={() => call('/api/mission/start')}>
              Iniciar fila
            </Button>
            <Button
              variant="secondary"
              disabled={pending || !active || stopping}
              loading={pendingAction === '/api/mission/stop' || stopping}
              onClick={() => call('/api/mission/stop')}
            >
              {stopping ? 'Parando…' : 'Parar missão'}
            </Button>
          </div>
        </div>

        <div className="border-t border-[var(--border)] p-5">
          <ProgressBar label="Progresso da missão" value={progress} />
        </div>

        <div aria-live="polite">{message ? <div className="px-5 pb-5"><Toast tone={tone} message={message} /></div> : null}</div>
      </Card>

      <Card padding={false}>
        <PanelHeader
          inset
          title="Missões disponíveis"
          description="A fila faz só as missões que dão Orbs, da maior recompensa para a menor."
          meta={orbMissions.length ? `${orbMissions.length} com Orbs · ${totalOrbs} Orbs no total` : undefined}
        />

        {catalogError ? (
          <div className="px-4 pt-4">
            <Toast
              tone="error"
              message={catalogError}
              action={<Button variant="secondary" className="min-h-9" loading={retrying} onClick={retry}>Atualizar lista</Button>}
            />
          </div>
        ) : null}

        {missions.length ? (
          <ul className="grid gap-3 p-4 xl:grid-cols-2 2xl:grid-cols-3">
            {missions.map((mission) => (
              <li key={mission.id} className={`grid gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-black/25 p-4 transition duration-150 hover:border-[var(--border-hover)] ${mission.available ? '' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-black/60 text-[var(--text-muted)]">
                    {mission.gameIconUrl || mission.largeImage ? (
                      <img src={mission.gameIconUrl || mission.largeImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Gamepad2 aria-hidden="true" className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]" title={mission.name}>{mission.name}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{mission.gameName}</p>
                      </div>
                      {mission.orbs ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgba(155,188,255,0.4)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                          {mission.orbs} Orbs
                        </span>
                      ) : (
                        <Badge tone="neutral">Sem Orbs</Badge>
                      )}
                    </div>
                    <dl className="mt-3 grid gap-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="text-[var(--text-muted)]">Tarefa:</dt>
                        <dd className="text-[var(--text-secondary)]">{mission.taskType ? taskLabels[mission.taskType] ?? mission.taskType : 'Desconhecida'}</dd>
                      </div>
                      {mission.orbs ? null : (
                        <div className="flex min-w-0 gap-2">
                          <dt className="text-[var(--text-muted)]">Recompensa:</dt>
                          <dd className="min-w-0 truncate text-[var(--text-secondary)]">{mission.reward}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <ProgressBar label="Progresso" value={mission.progress} />

                {mission.unavailableReason ? (
                  <p className="text-xs leading-5 text-[var(--text-muted)]">{mission.unavailableReason}</p>
                ) : null}

                <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                  <span className="text-xs text-[var(--text-muted)]">
                    {mission.enrolled ? 'Inscrito' : 'Não inscrito'}
                  </span>
                  <Button
                    onClick={() => call('/api/mission/start', { missionId: mission.id })}
                    disabled={!mission.available || pending || active}
                    loading={pendingAction === mission.id}
                    className="min-h-9"
                  >
                    Iniciar esta missão
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              title={catalogError ? 'Lista indisponível' : 'Nenhuma missão disponível'}
              description={catalogError ? 'Use “Atualizar lista” para tentar novamente.' : 'Quando o Discord liberar novas missões com Orbs para sua conta, elas aparecem aqui.'}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
