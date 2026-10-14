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
    return jsonFail('Não foi possível parar a sessão de voz.', error);
  }
}
