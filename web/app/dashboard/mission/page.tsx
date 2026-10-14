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
        title="Missões"
        description="Acompanhe a missão atual, o progresso e as recompensas, ou escolha a próxima missão."
      />
      <MissionLivePanel initialStatus={snapshot.status} initialAvailableMissions={snapshot.availableMissions ?? []} initialCatalogError={snapshot.availableMissionsError ?? ''} />
    </div>
  );
}
