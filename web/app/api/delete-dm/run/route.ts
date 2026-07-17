import { jsonFail, jsonOk, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    const data = await withApiLog(auth.userId, 'delete-dm', 'run', async () => ({
      todo: 'A ponte com o client ativo do bot e necessaria antes de apagar mensagens da DM pelo site.'
    }));
    return jsonOk('Solicitacao de apagar DM registrada. TODO: conectar a ponte com o bot ativo.', data);
  } catch (error) {
    return jsonFail('Nao foi possivel executar a limpeza da DM do bot.', error);
  }
}
