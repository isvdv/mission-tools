import { cleanService } from '@root/src/services/cleanService';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const status = await withApiLog(auth.userId, 'clean', 'stop', async () =>
      cleanService.stop(auth.userId)
    );
    return jsonOk('Limpeza parada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel parar a limpeza.', error);
  }
}
