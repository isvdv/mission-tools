import type { Metadata, Viewport } from 'next';
import { PwaServiceWorker } from '../components/PwaServiceWorker';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'Mission Tools',
  title: 'Painel Mission Tools',
  description: 'Painel com login por token para os modulos do bot Mission Tools.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/app-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/app-icon.svg', type: 'image/svg+xml' }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mission Tools'
  },
  formatDetection: {
    telephone: false
  },
  other: {
    google: 'notranslate'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#15191f'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" translate="no" suppressHydrationWarning>
      <body className="notranslate" translate="no" suppressHydrationWarning>
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}
