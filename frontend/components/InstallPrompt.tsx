'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  context?: 'dashboard' | 'share';
}

export function InstallPrompt({ context = 'dashboard' }: InstallPromptProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Verificar cooldown (7 dias)
      const dismissedUntil = localStorage.getItem('pwa-install-dismissed-until');
      const now = Date.now();

      if (dismissedUntil && now < parseInt(dismissedUntil)) {
        return;
      }

      // Se for contexto share, esperar 5 segundos
      if (context === 'share') {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Checar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [context]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed-until', sevenDaysFromNow.toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  const getMessage = () => {
    if (context === 'share') {
      return {
        title: 'Instalar Lifty',
        subtitle: 'Instale para importar este programa e acompanhar seus treinos'
      };
    }
    return {
      title: 'Instalar Lifty',
      subtitle: 'Acesso rápido e offline'
    };
  };

  const message = getMessage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 animate-slideUp">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{message.title}</p>
            <p className="text-slate-400 text-xs">{message.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
