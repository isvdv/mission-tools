import { NextRequest } from 'next/server';
import { authService } from '@root/src/services/authService';
import { logService } from '@root/src/services/logService';
import { assertRateLimit } from '@/lib/rateLimit';
import { jsonFail, jsonOk, setSessionCookie } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    assertRateLimit('auth:login', 10);
    const { token } = (await request.json()) as { token?: string };
    const session = await authService.loginWithToken(token ?? '');
    await setSessionCookie(authService.createSessionCookie(session));
    await logService.write({
      userId: session.userId,
      module: 'auth',
      action: 'login',
      result: 'success',
      message: 'Login por token concluido'
    });
    return jsonOk('Login concluido.', { userId: session.userId });
  } catch (error) {
    return jsonFail('Falha no login por token.', error, 401);
  }
}
