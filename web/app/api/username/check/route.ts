import { NextRequest } from 'next/server';
import { usernameService } from '@root/src/services/usernameService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    assertRateLimit(`username:check:${auth.userId}`, 10);
    const body = (await request.json()) as { usernames?: string[] };
    const results = await withApiLog(auth.userId, 'username', 'check', () =>
      usernameService.checkList(Array.isArray(body.usernames) ? body.usernames : [])
    );
    return jsonOk('Verificacao de usernames concluida.', { results });
  } catch (error) {
    return jsonFail('Nao foi possivel verificar os usernames.', error);
  }
}
