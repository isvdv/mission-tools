export type NavigationIcon =
  | 'dashboard'
  | 'mission'
  | 'clean'
  | 'voice'
  | 'presence'
  | 'usernames'
  | 'deleteDm'
  | 'logs'
  | 'settings';

export type NavigationItem = {
  href: string;
  label: string;
  command: string;
  icon: NavigationIcon;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Painel',
    items: [
      { href: '/dashboard', label: 'Visão geral', command: 'Ver resumo da conta', icon: 'dashboard' },
      { href: '/dashboard/mission', label: 'Missões', command: 'Acompanhar missões', icon: 'mission' },
      { href: '/dashboard/logs', label: 'Atividade', command: 'Consultar registros de atividade', icon: 'logs' }
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { href: '/dashboard/clean', label: 'Limpeza', command: 'Gerenciar limpeza de mensagens', icon: 'clean' },
      { href: '/dashboard/voice', label: 'Voz', command: 'Gerenciar sessão de voz', icon: 'voice' },
      { href: '/dashboard/presence', label: 'Presença', command: 'Personalizar Rich Presence', icon: 'presence' },
      { href: '/dashboard/username-checker', label: 'Nomes de usuário', command: 'Consultar nomes de usuário', icon: 'usernames' },
      { href: '/dashboard/delete-dm', label: 'Apagar DM', command: 'Limpar mensagens diretas do bot', icon: 'deleteDm' },
      { href: '/dashboard/settings', label: 'Configurações', command: 'Abrir configurações da conta', icon: 'settings' }
    ]
  }
];
