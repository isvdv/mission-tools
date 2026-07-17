import { presenceService } from '@root/src/services/presenceService';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const status = await withApiLog(auth.userId, 'presence', 'stop', async () =>
      presenceService.stop(auth.userId)
    );
    return jsonOk('Presenca parada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel parar a presenca.', error);
  }
}
