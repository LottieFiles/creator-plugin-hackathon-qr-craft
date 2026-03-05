import type { AnimationConfig } from '../../shared/types.ts';
import { generateLayerKeyframes } from '../../shared/animation.ts';

function getEasingCss(easing: AnimationConfig['easing']): string {
  switch (easing) {
    case 'linear':
      return 'linear';
    case 'ease-in':
      return 'cubic-bezier(0.42, 0, 1, 1)';
    case 'ease-out':
      return 'cubic-bezier(0, 0, 0.58, 1)';
    case 'ease-in-out':
      return 'cubic-bezier(0.42, 0, 0.58, 1)';
    case 'ease-in-cubic':
      return 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
    case 'ease-out-cubic':
      return 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    case 'ease-in-out-cubic':
      return 'cubic-bezier(0.645, 0.045, 0.355, 1)';
    case 'ease-in-expo':
      return 'cubic-bezier(0.95, 0.05, 0.795, 0.035)';
    case 'ease-out-expo':
      return 'cubic-bezier(0.19, 1, 0.22, 1)';
    case 'ease-in-out-expo':
      return 'cubic-bezier(1, 0, 0, 1)';
    case 'ease-in-back':
      return 'cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    case 'ease-out-back':
      return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    case 'ease-in-out-back':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    case 'bounce':
      return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    case 'spring':
      return 'cubic-bezier(0.25, 1.33, 0.35, 1)';
    case 'ease-out-elastic':
      return 'cubic-bezier(0.22, 1.36, 0.42, 1)';
  }
}

export interface CssAnimationResult {
  keyframesCSS: string;
  groupAnimations: Array<{ groupIndex: number; style: string }>;
}

export function generateCssAnimation(
  config: AnimationConfig,
  layerCount: number,
  framerate: number,
): CssAnimationResult {
  const totalFrames = config.durationFrames;
  const durationSec = totalFrames / framerate;
  const easingCss = getEasingCss(config.easing);
  const layerKeyframes = generateLayerKeyframes(config, layerCount);

  const keyframeBlocks: string[] = [];
  const groupAnimations: CssAnimationResult['groupAnimations'] = [];

  for (const lk of layerKeyframes) {
    const name = `qr-anim-${lk.groupIndex}`;
    const stops: Map<number, Record<string, string>> = new Map();

    // Opacity keyframes (Creator 0-100 → CSS 0-1)
    for (const kf of lk.keyframes.opacity) {
      const pct = totalFrames === 0 ? 0 : (kf.frame / totalFrames) * 100;
      const props = stops.get(pct) ?? {};
      props['opacity'] = `${kf.value / 100}`;
      stops.set(pct, props);
    }

    // Position keyframes → translate()
    if (lk.keyframes.position) {
      for (const kf of lk.keyframes.position) {
        const pct = totalFrames === 0 ? 0 : (kf.frame / totalFrames) * 100;
        const props = stops.get(pct) ?? {};
        props['translate'] = `${kf.value.x}px ${kf.value.y}px`;
        stops.set(pct, props);
      }
    }

    // Scale keyframes (Creator 100 = CSS 1)
    if (lk.keyframes.scale) {
      for (const kf of lk.keyframes.scale) {
        const pct = totalFrames === 0 ? 0 : (kf.frame / totalFrames) * 100;
        const props = stops.get(pct) ?? {};
        props['scale'] = `${kf.value.x / 100} ${kf.value.y / 100}`;
        stops.set(pct, props);
      }
    }

    // Rotation keyframes
    if (lk.keyframes.rotation) {
      for (const kf of lk.keyframes.rotation) {
        const pct = totalFrames === 0 ? 0 : (kf.frame / totalFrames) * 100;
        const props = stops.get(pct) ?? {};
        props['rotate'] = `${kf.value}deg`;
        stops.set(pct, props);
      }
    }

    // Build @keyframes block
    const sortedPcts = [...stops.keys()].sort((a, b) => a - b);
    const rules = sortedPcts.map((pct) => {
      const props = stops.get(pct)!;
      const declarations = Object.entries(props)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      return `${pct.toFixed(1)}% { ${declarations} }`;
    });

    keyframeBlocks.push(`@keyframes ${name} {\n  ${rules.join('\n  ')}\n}`);
    groupAnimations.push({
      groupIndex: lk.groupIndex,
      style: `animation: ${name} ${durationSec.toFixed(2)}s ${easingCss} forwards`,
    });
  }

  return {
    keyframesCSS: keyframeBlocks.join('\n'),
    groupAnimations,
  };
}
