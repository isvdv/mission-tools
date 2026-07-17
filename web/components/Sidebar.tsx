import Link from 'next/link';
import { Activity, Bot, Eraser, Home, ListChecks, MessageSquareX, Radio, Settings, Terminal, UserSearch } from 'lucide-react';
import { requireWebAuth } from '../lib/server';
import { avatarUrl, fetchCurrentAccount } from '../lib/discord';
import { Button } from './Button';

const items = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/mission', label: 'Missoes', icon: ListChecks },
  { href: '/dashboard/clean', label: 'Limpeza', icon: Eraser },
  { href: '/dashboard/voice', label: 'Voz', icon: Radio },
  { href: '/dashboard/presence', label: 'Presenca', icon: Activity },
  { href: '/dashboard/username-checker', label: 'Usernames', icon: UserSearch },
  { href: '/dashboard/delete-dm', label: 'Apagar DM', icon: MessageSquareX },
  { href: '/dashboard/logs', label: 'Logs', icon: Terminal },
  { href: '/dashboard/settings', label: 'Configuracoes', icon: Settings }
];

export async function Sidebar() {
  let account:
    | {
        id: string;
        username: string;
        global_name?: string | null;
        avatar?: string | null;
      }
    | null = null;
  let userId = '';

  try {
    const auth = await requireWebAuth();
    userId = auth.userId;
    account = await fetchCurrentAccount(auth.token);
  } catch {
    account = null;
  }

  return (
    <aside className="flex border-b border-white/10 bg-ink/80 p-4 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex-1">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyanSoft text-ink">
            <Bot className="h-5 w-5" />
          </span>
          <span>
            <strong className="block">Mission Tools</strong>
            <span className="text-xs text-slate-400">Central de Controle Web</span>
          </span>
        </Link>
        <nav className="grid gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 hidden rounded-lg border border-white/10 bg-white/[0.055] p-3 lg:block">
        <div className="flex items-center gap-3">
          {account ? (
            <img src={avatarUrl(account)} alt="" className="h-11 w-11 rounded-lg border border-white/10" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-sm">?</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {account?.global_name || account?.username || 'Conta Discord'}
            </p>
            <p className="truncate text-xs text-slate-400">{account?.id || userId || 'Sem ID'}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post" className="mt-3">
          <Button variant="secondary" type="submit" className="w-full">Sair</Button>
        </form>
      </div>
    </aside>
  );
}
