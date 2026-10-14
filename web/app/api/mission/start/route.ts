import { missionService } from '@root/src/services/missionService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const auth = await requireWebAuth();
    const rawBody = await request.text();
    const body: unknown = rawBody.trim() ? JSON.parse(rawBody) : {};
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonFail('Pedido de missao invalido.');
    }
    if ('missionId' in body && (typeof body.missionId !== 'string' || !/^\d+$/.test(body.missionId.trim()))) {
      return jsonFail('Selecione uma missao valida.');
    }
    const missionId = 'missionId' in body && typeof body.missionId === 'string' && body.missionId.trim()
      ? body.missionId.trim()
      : undefined;
    assertRateLimit(`mission:start:${auth.userId}`, 5);
    const status = await withApiLog(auth.userId, 'mission', 'start', () =>
      missionService.start(auth.userId, auth.token, { missionId })
    );
    return jsonOk('Missao iniciada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel iniciar a missao.', error);
  }
}
