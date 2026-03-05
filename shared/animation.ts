import type { AnimationConfig, AnimationKeyframes, LayerAnimationKeyframes } from './types.ts';

export function generateLayerKeyframes(
  config: AnimationConfig,
  layerCount: number,
): LayerAnimationKeyframes[] {
  const { revealStyle, durationFrames } = config;

  // Single-layer styles
  if (layerCount <= 1) {
    return [{ groupIndex: 0, keyframes: generateSingleLayerKeyframes(revealStyle, durationFrames) }];
  }

  // Multi-layer stagger timing
  const overlapFactor = 0.6;
  const perLayerDuration = durationFrames / (1 + (layerCount - 1) * (1 - overlapFactor));
  const staggerDelay = perLayerDuration * (1 - overlapFactor);

  const layers: LayerAnimationKeyframes[] = [];

  for (let i = 0; i < layerCount; i++) {
    const startFrame = Math.round(i * staggerDelay);
    const endFrame = Math.round(startFrame + perLayerDuration);
    const keyframes = generateMultiLayerKeyframes(revealStyle, startFrame, endFrame, i, layerCount);
    layers.push({ groupIndex: i, keyframes });
  }

  return layers;
}

function generateSingleLayerKeyframes(
  style: AnimationConfig['revealStyle'],
  dur: number,
): AnimationKeyframes {
  switch (style) {
    case 'fade-in':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: dur, value: 100 },
        ],
      };

    case 'drop-in':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: Math.round(dur * 0.3), value: 100 },
        ],
        scale: [
          { frame: 0, value: { x: 200, y: 200 } },
          { frame: dur, value: { x: 100, y: 100 } },
        ],
        rotation: [
          { frame: 0, value: 180 },
          { frame: dur, value: 0 },
        ],
      };

    case 'bounce-in':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: Math.round(dur * 0.15), value: 100 },
        ],
        scale: [
          { frame: 0, value: { x: 0, y: 0 } },
          { frame: Math.round(dur * 0.5), value: { x: 120, y: 120 } },
          { frame: Math.round(dur * 0.75), value: { x: 90, y: 90 } },
          { frame: dur, value: { x: 100, y: 100 } },
        ],
      };

    case 'spin-in':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: Math.round(dur * 0.2), value: 100 },
        ],
        scale: [
          { frame: 0, value: { x: 0, y: 0 } },
          { frame: dur, value: { x: 100, y: 100 } },
        ],
        rotation: [
          { frame: 0, value: 360 },
          { frame: dur, value: 0 },
        ],
      };

    case 'glitch': {
      // Rapid opacity flicker + position jitter, then settle
      const f1 = Math.round(dur * 0.1);
      const f2 = Math.round(dur * 0.2);
      const f3 = Math.round(dur * 0.3);
      const f4 = Math.round(dur * 0.45);
      const f5 = Math.round(dur * 0.6);
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: f1, value: 100 },
          { frame: f2, value: 0 },
          { frame: f3, value: 100 },
          { frame: f4, value: 0 },
          { frame: f5, value: 100 },
        ],
        position: [
          { frame: 0, value: { x: 8, y: -5 } },
          { frame: f1, value: { x: -6, y: 4 } },
          { frame: f2, value: { x: 5, y: -3 } },
          { frame: f3, value: { x: -4, y: 6 } },
          { frame: f4, value: { x: 3, y: -2 } },
          { frame: f5, value: { x: 0, y: 0 } },
        ],
      };
    }

    case 'zoom-out':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: Math.round(dur * 0.2), value: 100 },
        ],
        scale: [
          { frame: 0, value: { x: 300, y: 300 } },
          { frame: dur, value: { x: 100, y: 100 } },
        ],
      };

    case 'elastic-snap':
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: Math.round(dur * 0.1), value: 100 },
        ],
        scale: [
          { frame: 0, value: { x: 200, y: 50 } },
          { frame: Math.round(dur * 0.5), value: { x: 90, y: 110 } },
          { frame: Math.round(dur * 0.75), value: { x: 105, y: 95 } },
          { frame: dur, value: { x: 100, y: 100 } },
        ],
      };

    // Multi-layer styles that somehow have 1 layer — simple fallback
    default:
      return {
        opacity: [
          { frame: 0, value: 0 },
          { frame: dur, value: 100 },
        ],
      };
  }
}

function generateMultiLayerKeyframes(
  style: AnimationConfig['revealStyle'],
  startFrame: number,
  endFrame: number,
  layerIndex: number,
  _layerCount: number,
): AnimationKeyframes {
  const fadeEnd = startFrame + Math.round((endFrame - startFrame) * 0.3);

  switch (style) {
    case 'row-sweep':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        position: [
          { frame: startFrame, value: { x: -40, y: 0 } },
          { frame: endFrame, value: { x: 0, y: 0 } },
        ],
      };

    case 'spiral-reveal':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        scale: [
          { frame: startFrame, value: { x: 90, y: 90 } },
          { frame: endFrame, value: { x: 100, y: 100 } },
        ],
      };

    case 'pixel-scatter': {
      const rotationDir = layerIndex % 2 === 0 ? 10 : -10;
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: endFrame, value: 100 },
        ],
        scale: [
          { frame: startFrame, value: { x: 50, y: 50 } },
          { frame: endFrame, value: { x: 100, y: 100 } },
        ],
        rotation: [
          { frame: startFrame, value: rotationDir },
          { frame: endFrame, value: 0 },
        ],
      };
    }

    case 'column-sweep':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        position: [
          { frame: startFrame, value: { x: 0, y: 40 } },
          { frame: endFrame, value: { x: 0, y: 0 } },
        ],
      };

    case 'diagonal-wipe':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        scale: [
          { frame: startFrame, value: { x: 85, y: 85 } },
          { frame: endFrame, value: { x: 100, y: 100 } },
        ],
      };

    case 'checkerboard':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        scale: [
          { frame: startFrame, value: { x: 50, y: 50 } },
          { frame: endFrame, value: { x: 100, y: 100 } },
        ],
      };

    case 'quadrant-reveal': {
      // Each quadrant slides from its own corner
      const directions: Array<{ x: number; y: number }> = [
        { x: -30, y: -30 }, // top-left
        { x: 30, y: -30 },  // top-right
        { x: -30, y: 30 },  // bottom-left
        { x: 30, y: 30 },   // bottom-right
      ];
      const dir = directions[layerIndex % 4]!;
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        position: [
          { frame: startFrame, value: dir },
          { frame: endFrame, value: { x: 0, y: 0 } },
        ],
      };
    }

    case 'typewriter':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: startFrame + 1, value: 100 },
        ],
      };

    case 'ripple': {
      // Center-out with scale bounce
      const mid = startFrame + Math.round((endFrame - startFrame) * 0.6);
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        scale: [
          { frame: startFrame, value: { x: 80, y: 80 } },
          { frame: mid, value: { x: 110, y: 110 } },
          { frame: endFrame, value: { x: 100, y: 100 } },
        ],
      };
    }

    case 'rain':
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: fadeEnd, value: 100 },
        ],
        position: [
          { frame: startFrame, value: { x: 0, y: -60 } },
          { frame: endFrame, value: { x: 0, y: 0 } },
        ],
      };

    default:
      return {
        opacity: [
          { frame: startFrame, value: 0 },
          { frame: endFrame, value: 100 },
        ],
      };
  }
}
