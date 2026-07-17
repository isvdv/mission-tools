import { NextRequest } from 'next/server';
import { voiceService } from '@root/src/services/voiceService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireGuildPermission, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    assertRateLimit(`voice:start:${auth.userId}`, 10);
    const body = (await request.json()) as { guildId?: string; channelId?: string };
    await requireGuildPermission(auth.token, body.guildId);
    const status = await withApiLog(auth.userId, 'voice', 'start', async () =>
      voiceService.start(auth.userId, auth.token, body.guildId ?? '', body.channelId ?? '')
    );
    return jsonOk('Sessao de voz iniciada.', { status });
  } catch (error) {
    return jsonFail('Nao foi possivel iniciar a sessao de voz.', error);
  }
}
