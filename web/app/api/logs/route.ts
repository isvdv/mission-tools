import { logService } from '@root/src/services/logService';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET() {
  try {
    await requireWebAuth();
    const logs = await logService.list(100);
    return jsonOk('Logs carregados.', { logs });
  } catch (error) {
    return jsonFail('Nao foi possivel carregar os logs.', error, 401);
  }
}
