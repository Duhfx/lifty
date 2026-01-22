'use client';

import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh();
    } else {
      alert('Ainda sem conexão. Tente novamente em instantes.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-slate-800 rounded-full">
            <WifiOff size={48} className="text-slate-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Você está offline
        </h1>

        <p className="text-slate-400 mb-6">
          Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
        </p>

        <button
          onClick={handleRetry}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={20} />
          Tentar Novamente
        </button>

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors underline"
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
