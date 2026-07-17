'use client';

import { useEffect } from 'react';

export function PwaServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (error) {
        console.warn('Nao foi possivel registrar o app instalavel.', error);
      }
    };

    register();
  }, []);

  return null;
}
