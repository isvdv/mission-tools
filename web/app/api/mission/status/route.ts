import { missionService } from '@root/src/services/missionService';
import { jsonFail, jsonOk, requireWebAuth } from '@/lib/server';

export async function GET(request: Request) {
  try {
    const auth = await requireWebAuth();
    const snapshot = await missionService.getSnapshot(auth.userId, auth.token, new URL(request.url).searchParams.get('includeMissions') !== '0');
    return jsonOk('Status da missao carregado.', {
      ...snapshot,
      availableFunctions: [
        {
          name: 'Iniciar Missao',
          description: 'Busca as missoes validas e inicia a execucao automatica.',
          available: true
        },
        {
          name: 'Parar Missao',
          description: 'Cancela a missao em andamento ou remove a execucao da fila.',
          available: true
        },
        {
          name: 'Assistir Video',
          description: 'Avanca progresso de missoes de assistir video.',
          available: true
        },
        {
          name: 'Assistir Video no Mobile',
          description: 'Avanca progresso de missoes de assistir video no mobile.',
          available: true
        },
        {
          name: 'Jogar no Desktop',
          description: 'Envia heartbeats para missoes de jogar no desktop.',
          available: true
        },
        {
          name: 'Transmitir no Desktop',
          description: 'Detectado pelo bot, mas nao funciona mais via Node.',
          available: false
        },
        {
          name: 'Jogar Atividade',
          description: 'Detectado pelo bot, mas precisa ser concluido pelo app Discord.',
          available: false
        }
      ]
    });
  } catch (error) {
    return jsonFail('Nao foi possivel carregar o status da missao.', error, 500);
  }
}
