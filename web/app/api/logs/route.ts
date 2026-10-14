import { logService } from '@root/src/services/logService';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET() {
  try {
    const auth = await requireWebAuth();
    const logs = await logService.list(auth.userId, 100);
    return jsonOk('Logs carregados.', { logs });
  } catch (error) {
    return jsonFail('Não foi possível carregar os logs.', error, 500);
  }
}
