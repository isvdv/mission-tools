import { PageHeader } from '../../../components/PageHeader';
import { requireWebAuth } from '../../../lib/server';
import { presenceService } from '../../../../src/services/presenceService';
import { PresenceEditor } from './PresenceEditor';

export default async function PresencePage() {
  const auth = await requireWebAuth();
  const status = presenceService.getStatus(auth.userId);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Rich Presence"
        description="Configure textos, imagens, botao, ID do app e horario inicial da atividade."
      />
      <PresenceEditor initialStatus={status} />
    </div>
  );
}
