import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/dashboard',
    name: 'Mission Tools',
    short_name: 'Mission Tools',
    description: 'Painel instalavel para controlar os modulos do bot Mission Tools.',
    lang: 'pt-BR',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#15191f',
    theme_color: '#15191f',
    categories: ['productivity', 'utilities'],
    icons: [
      {
        src: '/app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/app-maskable-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Missoes',
        short_name: 'Missoes',
        description: 'Abrir controle de missoes',
        url: '/dashboard/mission',
        icons: [{ src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      },
      {
        name: 'Logs',
        short_name: 'Logs',
        description: 'Abrir registros do painel',
        url: '/dashboard/logs',
        icons: [{ src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }
    ]
  };
}
