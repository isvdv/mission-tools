import { NextRequest } from 'next/server';
import { settingsService } from '@root/src/services/settingsService';
import { jsonFail, jsonOk, requireGuildPermission, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    const body = (await request.json()) as {
      defaultGuildId?: string;
      defaultVoiceChannelId?: string;
      webhookUrl?: string;
      enabledModules?: Record<string, boolean>;
    };
    await requireGuildPermission(auth.token, body.defaultGuildId || undefined);
    const settings = await withApiLog(auth.userId, 'settings', 'update', () =>
      settingsService.update(auth.userId, {
        defaultGuildId: body.defaultGuildId || undefined,
        defaultVoiceChannelId: body.defaultVoiceChannelId || undefined,
        webhookUrl: body.webhookUrl || undefined,
        enabledModules: body.enabledModules
      })
    );
    return jsonOk('Configurações atualizadas.', { settings });
  } catch (error) {
    return jsonFail('Não foi possível atualizar as configurações.', error);
  }
}
