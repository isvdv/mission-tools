import { fetchCurrentAccount, avatarUrl } from '@/lib/discord';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET() {
  try {
    const auth = await requireWebAuth();
    const account = await fetchCurrentAccount(auth.token);
    return jsonOk('Conta autenticada carregada.', {
      ...account,
      avatarUrl: avatarUrl(account)
    });
  } catch (error) {
    return jsonFail('Login obrigatório.', error, 401);
  }
}
