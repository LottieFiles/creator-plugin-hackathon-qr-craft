import { useState, useCallback } from 'react';
import type { QRConfig, QRContentType, AnimationConfig, ContentTypeData, DotStyle, CornerStyle, CornerDotStyle } from '../../shared/types.ts';
import { encodeQRContent } from '../utils/qr-content-encoder.ts';

const DOT_STYLES: DotStyle[] = ['square', 'rounded', 'circle', 'diamond', 'cross', 'star', 'hexagon', 'classy', 'heart', 'ring'];
const CORNER_STYLES: CornerStyle[] = ['square', 'rounded', 'circle', 'extra-rounded', 'dot', 'classy', 'leaf'];
const CORNER_DOT_STYLES: CornerDotStyle[] = ['square', 'rounded', 'circle', 'star', 'heart', 'diamond'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

function randomDarkHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 30 + Math.floor(Math.random() * 70); // 30-100%
  const l = 10 + Math.floor(Math.random() * 40); // 10-50%
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const DEFAULT_CONTENT_DATA: ContentTypeData = {
  url: { url: 'https://lottiefiles.com' },
  text: { text: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  sms: { number: '', message: '' },
  phone: { number: '' },
  email: { email: '', subject: '', body: '' },
  vcard: { firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' },
  geo: { latitude: '', longitude: '', label: '' },
  event: { title: '', startDate: '', startTime: '', endDate: '', endTime: '', location: '', description: '' },
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

  const randomizeStyles = useCallback(() => {
    setQRConfig((prev) => ({
      ...prev,
      dotStyle: randomFrom(DOT_STYLES),
      cornerStyle: randomFrom(CORNER_STYLES),
      cornerDotStyle: randomFrom(CORNER_DOT_STYLES),
      fgColor: randomDarkHex(),
      bgColor: '#ffffff',
      useGradient: Math.random() > 0.5,
      gradientStart: randomHex(),
      gradientEnd: randomHex(),
      gradientType: randomFrom(['linear', 'radial'] as const),
      useCornerGradient: Math.random() > 0.5,
      cornerGradientStart: randomHex(),
      cornerGradientEnd: randomHex(),
      cornerGradientType: randomFrom(['linear', 'radial'] as const),
    }));
  }, []);

  return { qrConfig, updateQRConfig, animationConfig, updateAnimationConfig, updateContentType, updateContentField, randomizeStyles };
}
