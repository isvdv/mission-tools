import { NextRequest } from 'next/server';
import { authService } from '@root/src/services/authService';
import { logService } from '@root/src/services/logService';
import { assertRateLimit, clientAddress } from '@/lib/rateLimit';
import { jsonFail, jsonOk, setSessionCookie } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    // Per-address limit, plus a global ceiling in case the address is spoofed.
    assertRateLimit(`auth:login:${clientAddress(request)}`, 10);
    assertRateLimit('auth:login', 60);
    const { token } = (await request.json()) as { token?: string };
    const session = await authService.loginWithToken(token ?? '');
    await setSessionCookie(authService.createSessionCookie(session));
    await logService.write({
      userId: session.userId,
      module: 'auth',
      action: 'login',
      result: 'success',
      message: 'Login por token concluído'
    });
    return jsonOk('Login concluído.', { userId: session.userId });
  } catch (error) {
    return jsonFail('Falha no login por token.', error, 401);
  }
}
