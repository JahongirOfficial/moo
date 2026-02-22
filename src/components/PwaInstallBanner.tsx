import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Global o'zgaruvchi - event'ni saqlash
let deferredPromptGlobal: BeforeInstallPromptEvent | null = null;

// Event'ni oldindan ushlash
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptGlobal = e as BeforeInstallPromptEvent;
  });
}

export function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // PWA allaqachon o'rnatilganmi tekshirish
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    const isDismissed = localStorage.getItem('pwaInstallDismissed');
    
    if (isStandalone || isDismissed) {
      return;
    }

    // iOS tekshirish
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Banner'ni ko'rsatish
    setShowBanner(true);
  }, []);

  const handleInstall = async () => {
    if (deferredPromptGlobal) {
      // Chrome/Edge/Android - o'rnatish dialogini chiqarish
      // Brauzer xavfsizlik sababli dialog majburiy
      deferredPromptGlobal.prompt();
      
      // Natijani kutish
      deferredPromptGlobal.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') {
          setShowBanner(false);
          localStorage.setItem('pwaInstallDismissed', 'true');
        }
        deferredPromptGlobal = null;
      });
    } else if (isIOS) {
      // iOS uchun modal ko'rsatish
      alert("📱 Ilovani o'rnatish:\n\n1. Pastdagi 'Ulashish' tugmasini bosing\n2. 'Bosh ekranga qo'shish' ni tanlang");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-xl shrink-0">download</span>
          <p className="text-sm font-medium truncate">Ilovani o'rnating</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg font-semibold text-xs hover:bg-emerald-50 transition-colors"
          >
            O'rnatish
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
