export type StandardResponse<T = unknown> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error?: string };

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<StandardResponse<T>> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    }
  });

  return (await response.json()) as StandardResponse<T>;
}
