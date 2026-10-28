import { useEffect, useRef, useState } from 'react';

/**
 * Registro do service worker com atualização controlada:
 * a nova versão só assume quando o usuário toca em "Atualizar agora",
 * para não trocar o app no meio de um exercício.
 */
export function useUpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
    let cancelled = false;
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (cancelled) return;
        updateRef.current = registerSW({
          immediate: true,
          onNeedRefresh: () => setNeedRefresh(true),
          onOfflineReady: () => setOfflineReady(true),
          onRegisterError: (e: unknown) => console.warn('Service worker não registrado:', e),
        });
      })
      .catch((e) => console.warn('PWA indisponível:', e));
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    needRefresh,
    offlineReady,
    apply: () => void updateRef.current?.(true),
    dismiss: () => {
      setNeedRefresh(false);
      setOfflineReady(false);
    },
  };
}

/** Evento de instalação (Chrome/Edge/Android). Outros navegadores usam o menu próprio. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const standalone = typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
  return {
    canPrompt: !!deferred,
    installed: standalone,
    async prompt() {
      if (!deferred) return;
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      force((n) => n + 1);
    },
  };
}

/** Instruções por plataforma, sem prometer comportamento igual em todos. */
export function installInstructions(): { platform: string; steps: string[] } {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) return { platform: 'iPhone / iPad (Safari)', steps: ['Abra este endereço no Safari.', 'Toque em Compartilhar (quadrado com seta).', 'Escolha "Adicionar à Tela de Início".'] };
  if (/Firefox/.test(ua) && /Android/.test(ua)) return { platform: 'Firefox no Android', steps: ['Abra o menu (⋮).', 'Toque em "Instalar".'] };
  if (/Firefox/.test(ua)) return { platform: 'Firefox no computador', steps: ['O Firefox para computador não instala PWAs. Use Chrome ou Edge, ou mantenha o app numa aba fixada.'] };
  if (/SamsungBrowser/.test(ua)) return { platform: 'Samsung Internet', steps: ['Toque no ícone de download na barra de endereço, ou menu → "Adicionar página a" → "Tela inicial".'] };
  if (/Android/.test(ua)) return { platform: 'Chrome no Android', steps: ['Toque no menu (⋮).', 'Escolha "Instalar app" ou "Adicionar à tela inicial".'] };
  return { platform: 'Chrome / Edge no computador', steps: ['Clique no ícone de instalação na barra de endereço (monitor com seta), ou menu → "Instalar Guitar Lab".'] };
}
