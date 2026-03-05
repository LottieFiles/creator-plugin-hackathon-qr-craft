export type DotStyle =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'diamond'
  | 'cross'
  | 'star'
  | 'hexagon'
  | 'classy'
  | 'heart'
  | 'ring';

export type CornerStyle =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'extra-rounded'
  | 'dot'
  | 'classy'
  | 'leaf';

export interface QRConfig {
  text: string;
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  fgColor: string;
  bgColor: string;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientType: 'linear' | 'radial';
  logoDataUrl: string | null;
  logoSizePercent: number;
}

export type RevealStyle =
  | 'fade-in'
  | 'row-sweep'
  | 'spiral-reveal'
  | 'pixel-scatter'
  | 'drop-in'
  | 'column-sweep'
  | 'diagonal-wipe'
  | 'checkerboard'
  | 'quadrant-reveal'
  | 'bounce-in'
  | 'spin-in'
  | 'glitch'
  | 'zoom-out'
  | 'typewriter'
  | 'ripple'
  | 'rain'
  | 'elastic-snap';

export interface AnimationConfig {
  revealStyle: RevealStyle;
  durationFrames: number;
  easing:
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'ease-in-cubic'
    | 'ease-out-cubic'
    | 'ease-in-out-cubic'
    | 'ease-in-expo'
    | 'ease-out-expo'
    | 'ease-in-out-expo'
    | 'ease-in-back'
    | 'ease-out-back'
    | 'ease-in-out-back'
    | 'bounce'
    | 'spring'
    | 'ease-out-elastic';
}

export interface OpacityKeyframe {
  frame: number;
  value: number;
}

export interface PositionKeyframe {
  frame: number;
  value: { x: number; y: number };
}

export interface ScaleKeyframe {
  frame: number;
  value: { x: number; y: number };
}

export interface RotationKeyframe {
  frame: number;
  value: number;
}

export interface AnimationKeyframes {
  opacity: OpacityKeyframe[];
  position?: PositionKeyframe[];
  scale?: ScaleKeyframe[];
  rotation?: RotationKeyframe[];
}

export interface LayerAnimationKeyframes {
  groupIndex: number;
  keyframes: AnimationKeyframes;
}

export interface QRLayer {
  svgString: string;
  groupIndex: number;
}

export type UIToPluginMessage =
  | { type: 'ui-ready' }
  | { type: 'get-scene-info' }
  | { type: 'insert-qr'; data: { layers: QRLayer[]; animationConfig: AnimationConfig } };

export type PluginToUIMessage =
  | { type: 'theme-change'; data: { tokens: Record<string, string>; themeName: string } }
  | { type: 'scene-info'; data: { framerate: number; duration: number } }
  | { type: 'insert-qr-result'; data: { success: boolean; error?: string } };
