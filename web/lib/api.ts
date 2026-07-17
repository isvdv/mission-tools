export type StandardResponse<T = unknown> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error?: string };

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<StandardResponse<T>> {
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      }
    });

    const rawBody = await response.text();
    const parsed = rawBody ? JSON.parse(rawBody) as StandardResponse<T> : null;

    if (parsed?.success === true || parsed?.success === false) {
      return parsed;
    }

    return {
      success: false,
      message: response.ok ? 'Resposta inesperada da API.' : `Erro HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Nao foi possivel concluir a requisicao.',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
