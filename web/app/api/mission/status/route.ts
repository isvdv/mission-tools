import { missionService } from '@root/src/services/missionService';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET(request: Request) {
  try {
    const auth = await requireWebAuth();
    const snapshot = await missionService.getSnapshot(auth.userId, auth.token, new URL(request.url).searchParams.get('includeMissions') !== '0');
    return jsonOk('Status da missão carregado.', {
      ...snapshot,
      availableFunctions: [
        {
          name: 'Iniciar Missão',
          description: 'Busca as missões válidas e inicia a execução automática.',
          available: true
        },
        {
          name: 'Parar Missão',
          description: 'Cancela a missão em andamento ou remove a execução da fila.',
          available: true
        },
        {
          name: 'Assistir Vídeo',
          description: 'Avança progresso de missões de assistir vídeo.',
          available: true
        },
        {
          name: 'Assistir Vídeo no Mobile',
          description: 'Avança progresso de missões de assistir vídeo no mobile.',
          available: true
        },
        {
          name: 'Jogar no Desktop',
          description: 'Envia heartbeats para missões de jogar no desktop.',
          available: true
        },
        {
          name: 'Transmitir no Desktop',
          description: 'Detectado pelo bot, mas não funciona mais via Node.',
          available: false
        },
        {
          name: 'Jogar Atividade',
          description: 'Detectado pelo bot, mas precisa ser concluído pelo app Discord.',
          available: false
        }
      ]
    });
  } catch (error) {
    return jsonFail('Não foi possível carregar o status da missão.', error, 500);
  }
}
