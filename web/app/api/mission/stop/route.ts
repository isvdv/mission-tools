import { missionService } from '@root/src/services/missionService';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const status = await withApiLog(auth.userId, 'mission', 'stop', async () =>
      missionService.stop(auth.userId)
    );
    return jsonOk(status.active ? 'Cancelamento solicitado. Aguarde o processo encerrar.' : 'Nenhuma missão em execução.', { status });
  } catch (error) {
    return jsonFail('Não foi possível parar a missão.', error);
  }
}
