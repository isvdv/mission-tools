import { missionService } from '@root/src/services/missionService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    assertRateLimit(`mission:start:${auth.userId}`, 5);
    const status = await withApiLog(auth.userId, 'mission', 'start', () =>
      missionService.start(auth.userId, auth.token)
    );
    return jsonOk('Missao iniciada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel iniciar a missao.', error);
  }
}
