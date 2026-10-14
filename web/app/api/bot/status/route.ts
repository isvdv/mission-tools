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
    return jsonFail('Não foi possível carregar o status do bot.', error, 500);
  }
}
