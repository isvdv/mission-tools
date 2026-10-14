import { jsonFail, requireWebAuth, withApiLog } from '@/lib/server';

export async function POST() {
  try {
    const auth = await requireWebAuth();
    await withApiLog(auth.userId, 'delete-dm', 'run', async () => {
      throw new Error('A limpeza de DM pelo app ainda não está disponível.');
    });
    return jsonFail('Limpeza de DM indisponível pelo app.', undefined, 501);
  } catch (error) {
    return jsonFail('Limpeza de DM indisponível pelo app.', error, 501);
  }
}
