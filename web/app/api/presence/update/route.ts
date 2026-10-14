import { NextRequest } from 'next/server';
import { presenceService } from '@root/src/services/presenceService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    assertRateLimit(`presence:update:${auth.userId}`, 20);
    const config = (await request.json()) as Record<string, unknown>;
    const status = await withApiLog(auth.userId, 'presence', 'update', async () =>
      presenceService.update(auth.userId, auth.token, {
        applicationId: typeof config.applicationId === 'string' ? config.applicationId : undefined,
        name: typeof config.name === 'string' ? config.name : undefined,
        description: typeof config.description === 'string' ? config.description : undefined,
        details: typeof config.details === 'string' ? config.details : undefined,
        state: typeof config.state === 'string' ? config.state : undefined,
        buttonLabel: typeof config.buttonLabel === 'string' ? config.buttonLabel : undefined,
        buttonUrl: typeof config.buttonUrl === 'string' ? config.buttonUrl : undefined,
        largeImage: typeof config.largeImage === 'string' ? config.largeImage : undefined,
        largeText: typeof config.largeText === 'string' ? config.largeText : undefined,
        smallImage: typeof config.smallImage === 'string' ? config.smallImage : undefined,
        smallText: typeof config.smallText === 'string' ? config.smallText : undefined,
        startTimestamp: typeof config.startTimestamp === 'string' ? config.startTimestamp : undefined,
        activityType: typeof config.activityType === 'number' ? config.activityType as 0 | 1 | 2 | 3 | 5 : 0
      })
    );
    return jsonOk('Presença atualizada.', { status });
  } catch (error) {
    return jsonFail('Não foi possível atualizar a presença.', error);
  }
}
