'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setJustWentOnline(false);
    } else if (show) {
      // Estava offline e voltou online
      setJustWentOnline(true);
      setTimeout(() => {
        setShow(false);
        setJustWentOnline(false);
      }, 3000);
    }
  }, [isOnline, show]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-medium ${
        justWentOnline
          ? 'bg-green-600 text-white'
          : 'bg-amber-600 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {justWentOnline ? (
          <>
            <Wifi size={16} />
            <span>Conectado novamente</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Modo Offline - Dados salvos localmente</span>
          </>
        )}
      </div>
    </div>
  );
}
