import { PageHeader } from '../../../components/PageHeader';
import { requireWebAuth } from '../../../lib/server';
import { missionService } from '../../../../src/services/missionService';
import { MissionLivePanel } from './MissionLivePanel';

export default async function MissionPage() {
  const auth = await requireWebAuth();
  const snapshot = await missionService.getSnapshot(auth.userId, auth.token);
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Sistema de Missoes"
        description="Acompanhe a missao atual, progresso, recompensa e capacidades disponiveis do runner."
      />
      <MissionLivePanel initialStatus={snapshot.status} initialAvailableMissions={snapshot.availableMissions ?? []} initialCatalogError={snapshot.availableMissionsError ?? ''} />
    </div>
  );
}
