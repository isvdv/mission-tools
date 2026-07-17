import { missionService } from '@root/src/services/missionService';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const status = await withApiLog(auth.userId, 'mission', 'stop', async () =>
      missionService.stop(auth.userId)
    );
    return jsonOk('Missao parada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel parar a missao.', error);
  }
}
