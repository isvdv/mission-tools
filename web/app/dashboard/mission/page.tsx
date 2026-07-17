import { Card } from '../../../components/Card';
import { requireWebAuth } from '../../../lib/server';
import { missionService } from '../../../../src/services/missionService';
import { MissionLivePanel } from './MissionLivePanel';

export default async function MissionPage() {
  const auth = await requireWebAuth();
  const status = await missionService.getStatus(auth.userId);
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Sistema de Missoes</h2>
        <p className="mt-2 text-slate-300">Veja a missao atual, o progresso e todas as funcoes disponiveis para o sistema de missoes.</p>
      </Card>
      <MissionLivePanel initialStatus={status} />
    </div>
  );
}
