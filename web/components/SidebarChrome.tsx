'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  Eraser,
  Home,
  ListChecks,
  Menu,
  MessageSquareX,
  Radio,
  Settings,
  Terminal,
  UserSearch,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { navigationGroups, type NavigationIcon, type NavigationItem } from '../lib/navigation';
import { Button } from './Button';

type SidebarAccount = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

const iconMap: Record<NavigationIcon, LucideIcon> = {
  dashboard: Home,
  mission: ListChecks,
  clean: Eraser,
  voice: Radio,
  presence: Activity,
  usernames: UserSearch,
  deleteDm: MessageSquareX,
  logs: Terminal,
  settings: Settings
};

function NavLink({ item, onNavigate }: { item: NavigationItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const Icon = iconMap[item.icon];
  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-11 items-center gap-3 border-l px-3 text-sm transition duration-150 ${
        active
          ? 'border-[var(--accent)] bg-[var(--surface-secondary)] text-[var(--text-primary)]'
          : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarChrome({
  account,
  userId,
  avatarSrc
}: {
  account: SidebarAccount | null;
  userId: string;
  avatarSrc?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-40 grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] lg:hidden"
        aria-label="Abrir navegação"
        aria-expanded={open}
        aria-controls="sidebar-navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar navegacao"
        />
      ) : null}

      <aside
        id="sidebar-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 lg:translate-x-0 ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'
        }`}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)] bg-black text-[var(--accent)]">
              <Bot className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-sm text-[var(--text-primary)]">Mission Tools</strong>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">Seu espaço no Discord</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] lg:hidden"
            aria-label="Fechar navegacao"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-xs font-medium text-[var(--text-muted)]">{group.label}</p>
              <div className="grid gap-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-3 flex items-center gap-3">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-10 w-10 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-black font-mono text-xs text-[var(--text-muted)]">
                ?
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {account?.global_name || account?.username || 'Conta Discord'}
              </p>
              <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">ID: {account?.id || userId || 'NO_ID'}</p>
            </div>
          </div>
          <div className="mb-3 flex items-center justify-between border-y border-[var(--border)] py-2 font-mono text-[11px]">
            <span className="text-[var(--text-muted)]">Sessão</span>
            <span className="inline-flex items-center gap-2 text-[var(--success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              Autenticada
            </span>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button variant="secondary" type="submit" className="w-full">Sair da conta</Button>
          </form>
        </div>
      </aside>
    </>
  );
}
