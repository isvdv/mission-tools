import { NextRequest } from 'next/server';
import { cleanService } from '@root/src/services/cleanService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    assertRateLimit(`clean:start:${auth.userId}`, 3);
    const body = (await request.json().catch(() => ({}))) as { targetUserId?: string };
    const status = await withApiLog(auth.userId, 'clean', 'start', () =>
      cleanService.start(auth.userId, auth.token, {
        targetUserId: body.targetUserId
      })
    );
    return jsonOk('Limpeza iniciada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel iniciar a limpeza.', error);
  }
}
