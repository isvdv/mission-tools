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

    if (response.status === 401 && !path.startsWith('/api/auth/') && typeof window !== 'undefined') {
      // Session expired or token revoked: polling would otherwise keep failing silently.
      window.location.assign('/login');
    }

    const rawBody = await response.text();
    let parsed: StandardResponse<T> | null = null;
    try {
      parsed = rawBody ? JSON.parse(rawBody) as StandardResponse<T> : null;
    } catch {
      // Non-JSON body (proxy error page, crash): reported by HTTP status below.
    }

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
