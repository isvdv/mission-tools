import { fetchManageableGuilds } from '@/lib/discord';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET() {
  try {
    const auth = await requireWebAuth();
    const guilds = await fetchManageableGuilds(auth.token);
    return jsonOk('Servidores carregados.', { guilds });
  } catch (error) {
    return jsonFail('Nao foi possivel carregar os servidores.', error, 500);
  }
}
