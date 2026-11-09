'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (options: {
        eventHandler: (event: { event: string; data?: any }) => void;
      }) => void;
    };
  }
}

export function LemonOverlay() {
  const initLemon = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.createLemonSqueezy === 'function') {
        window.createLemonSqueezy();
        window.LemonSqueezy?.Setup({
          eventHandler: (event) => {
            if (event.event === 'Checkout.Success') {
              window.location.href = '/dashboard?upgraded=true';
            }
          },
        });
      }
    } catch (err) {
      console.warn('Lemon.js overlay notice:', err);
    }
  };

  useEffect(() => {
    initLemon();
  }, []);

  return (
    <Script
      src="https://assets.lemonsqueezy.com/lemon.js"
      strategy="afterInteractive"
      onLoad={initLemon}
    />
  );
}
