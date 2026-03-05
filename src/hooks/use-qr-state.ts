import { useState, useCallback } from 'react';
import type { QRConfig, QRContentType, AnimationConfig, ContentTypeData } from '../../shared/types.ts';
import { encodeQRContent } from '../utils/qr-content-encoder.ts';

const DEFAULT_CONTENT_DATA: ContentTypeData = {
  url: { url: 'https://lottiefiles.com' },
  text: { text: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  sms: { number: '', message: '' },
  phone: { number: '' },
  email: { email: '', subject: '', body: '' },
};

const DEFAULT_QR_CONFIG: QRConfig = {
  text: 'https://lottiefiles.com',
  contentType: 'url',
  contentData: DEFAULT_CONTENT_DATA,
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
  cornerDotStyle: 'square',
  useCornerGradient: false,
  cornerGradientStart: '#ef4444',
  cornerGradientEnd: '#f97316',
  cornerGradientType: 'linear',
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

  const updateContentType = useCallback((type: QRContentType) => {
    setQRConfig((prev) => ({
      ...prev,
      contentType: type,
      text: encodeQRContent(type, prev.contentData[type]),
    }));
  }, []);

  const updateContentField = useCallback(
    <T extends QRContentType>(type: T, field: keyof ContentTypeData[T], value: ContentTypeData[T][keyof ContentTypeData[T]]) => {
      setQRConfig((prev) => {
        const updatedTypeData = { ...prev.contentData[type], [field]: value };
        const contentData = { ...prev.contentData, [type]: updatedTypeData };
        return {
          ...prev,
          contentData,
          text: encodeQRContent(type, updatedTypeData),
        };
      });
    },
    [],
  );

  const updateAnimationConfig = useCallback(
    <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
      setAnimationConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { qrConfig, updateQRConfig, animationConfig, updateAnimationConfig, updateContentType, updateContentField };
}
