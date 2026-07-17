import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { clearSessionCookie, requireWebAuth } from '@/lib/server';
import { authService } from '@root/src/services/authService';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWebAuth();
    await authService.logout(auth.userId);
  } catch {
    // Sair deve limpar a sessao do navegador mesmo assim.
  }

  await clearSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
