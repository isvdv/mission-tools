import Link from 'next/link';
import { Activity, ArrowUpRight, Eraser, ListChecks, MessageSquareX, Radio, UserSearch } from 'lucide-react';

const tools = [
  { href: '/dashboard/mission', title: 'Missões', description: 'Acompanhe a fila e o progresso das suas missões.', icon: ListChecks },
  { href: '/dashboard/voice', title: 'Sessão de voz', description: 'Escolha um canal e gerencie sua conexão.', icon: Radio },
  { href: '/dashboard/presence', title: 'Rich Presence', description: 'Personalize a atividade exibida no seu perfil.', icon: Activity },
  { href: '/dashboard/clean', title: 'Limpeza', description: 'Organize mensagens com controle sobre a execução.', icon: Eraser },
  { href: '/dashboard/username-checker', title: 'Nomes de usuário', description: 'Consulte os nomes que você quer usar.', icon: UserSearch },
  { href: '/dashboard/delete-dm', title: 'Mensagens diretas', description: 'Gerencie a limpeza das mensagens do bot.', icon: MessageSquareX }
];

export function ToolDirectory() {
  return <div className="divide-y divide-[var(--border)]">{tools.map(({ href, title, description, icon: Icon }) => (
    <Link key={href} href={href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-secondary)] sm:px-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--surface-raised)] text-[var(--accent)]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-sm leading-5 text-[var(--text-secondary)]">{description}</span></span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
    </Link>
  ))}</div>;
}
