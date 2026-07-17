import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authService, WEB_SESSION_COOKIE, WEB_SESSION_MAX_AGE_SECONDS } from '@root/src/services/authService';
import { fail, ok } from '@root/src/services/apiResponse';
import { logService } from '@root/src/services/logService';
import { accountCanManageGuild } from './discord';

export function jsonOk<T>(message: string, data: T, init?: ResponseInit) {
  return NextResponse.json(ok(message, data), init);
}

export function jsonFail(message: string, error?: unknown, status = 400) {
  return NextResponse.json(fail(message, error), { status });
}

function shouldUseSecureCookies() {
  const baseUrl = process.env.WEB_BASE_URL;
  if (baseUrl) {
    try {
      return new URL(baseUrl).protocol === 'https:';
    } catch {
      return process.env.NODE_ENV === 'production';
    }
  }

  return process.env.NODE_ENV === 'production';
}

export async function setSessionCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set(WEB_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    maxAge: WEB_SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(WEB_SESSION_COOKIE);
}

export async function requireWebAuth() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(WEB_SESSION_COOKIE)?.value;
  const session = authService.parseSessionCookie(cookieValue);
  if (!session) throw new Error('Login obrigatorio.');

  const token = await authService.requireToken(session.userId);
  return {
    userId: session.userId,
    token
  };
}

export async function requireGuildPermission(token: string, guildId?: string) {
  const allowed = await accountCanManageGuild(token, guildId);
  if (!allowed) throw new Error('Voce nao tem permissao nesse servidor.');
}

export async function withApiLog<T>(
  userId: string,
  moduleName: string,
  action: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    const data = await operation();
    await logService.write({
      userId,
      module: moduleName,
      action,
      result: 'success',
      message: `${moduleName}.${action} concluido`
    });
    return data;
  } catch (error) {
    await logService.write({
      userId,
      module: moduleName,
      action,
      result: 'error',
      message: `${moduleName}.${action} falhou`,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
