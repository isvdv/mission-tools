import { Card } from '../../../components/Card';
import { requireWebAuth } from '../../../lib/server';
import { presenceService } from '../../../../src/services/presenceService';
import { PresenceEditor } from './PresenceEditor';

export default async function PresencePage() {
  const auth = await requireWebAuth();
  const status = presenceService.getStatus(auth.userId);

  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Rich Presence</h2>
        <p className="mt-2 text-slate-300">
          Configure textos, imagens, botao, ID do app e horario inicial da atividade.
        </p>
      </Card>
      <PresenceEditor initialStatus={status} />
    </div>
  );
}
