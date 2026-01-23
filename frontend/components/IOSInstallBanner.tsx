'use client';

import { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detectar iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window as any).navigator.standalone ||
                        window.matchMedia('(display-mode: standalone)').matches;

    if (!isIOS || isStandalone) {
      return;
    }

    // Verificar cooldown (7 dias)
    const dismissedUntil = localStorage.getItem('ios-install-dismissed-until');
    const now = Date.now();

    if (dismissedUntil && now < parseInt(dismissedUntil)) {
      return;
    }

    // Mostrar após 5 segundos
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('ios-install-dismissed-until', sevenDaysFromNow.toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 text-sm">
          <Share size={18} className="shrink-0" />
          <span>
            Instale o app: toque em <Share size={14} className="inline mx-0.5" /> e depois em
            <span className="font-bold mx-1">Adicionar à Tela Inicial</span>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
