import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET() {
  try {
    await requireWebAuth();
    return jsonOk('Status do bot carregado.', {
      status: 'online',
      modules: ['mission', 'clean', 'voice', 'presence', 'username', 'delete-dm'],
      runtime: 'web-dashboard'
    });
  } catch (error) {
    return jsonFail('Nao foi possivel carregar o status do bot.', error, 401);
  }
}
