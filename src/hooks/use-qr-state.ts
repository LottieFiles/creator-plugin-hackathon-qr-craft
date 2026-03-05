import { useState, useCallback } from 'react';
import type { QRConfig, AnimationConfig } from '../../shared/types.ts';

const DEFAULT_QR_CONFIG: QRConfig = {
  text: 'https://lottiefiles.com',
  size: 400,
  errorCorrection: 'M',
  dotStyle: 'square',
  cornerStyle: 'square',
  fgColor: '#000000',
  bgColor: '#ffffff',
  useGradient: false,
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  gradientType: 'linear',
  logoDataUrl: null,
  logoSizePercent: 20,
};

const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  revealStyle: 'fade-in',
  durationFrames: 30,
  easing: 'ease-out',
};

export function useQRState() {
  const [qrConfig, setQRConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(DEFAULT_ANIMATION_CONFIG);

  const updateQRConfig = useCallback(<K extends keyof QRConfig>(key: K, value: QRConfig[K]) => {
    setQRConfig((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-switch to H error correction when logo is added
      if (key === 'logoDataUrl' && value !== null && prev.errorCorrection !== 'H') {
        next.errorCorrection = 'H';
      }
      return next;
    });
  }, []);

  const updateAnimationConfig = useCallback(
    <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
      setAnimationConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { qrConfig, updateQRConfig, animationConfig, updateAnimationConfig };
}
