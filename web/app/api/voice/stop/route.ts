import { voiceService } from '@root/src/services/voiceService';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const status = await withApiLog(auth.userId, 'voice', 'stop', async () =>
      voiceService.stop(auth.userId)
    );
    return jsonOk('Sessao de voz parada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel parar a sessao de voz.', error);
  }
}
