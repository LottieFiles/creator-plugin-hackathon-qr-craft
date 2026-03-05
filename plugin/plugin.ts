import type { UIToPluginMessage, AnimationConfig } from '../shared/types.ts';
import { generateLayerKeyframes } from '../shared/animation.ts';

creator.ui.show({
  width: 380,
  height: 800,
});

function sendTheme() {
  const theme = creator.ui.theme;
  creator.ui.postMessage({
    type: 'theme-change',
    data: {
      tokens: theme.tokens,
      themeName: theme.themeName,
    },
  });
}

function getEasingConfig(easing: AnimationConfig['easing']) {
  const cb = (x1: number, y1: number, x2: number, y2: number) =>
    ({ type: 'CUBIC_BEZIER' as const, x1, y1, x2, y2 });

  switch (easing) {
    case 'linear':
      return undefined;
    case 'ease-in':
      return cb(0.42, 0, 1, 1);
    case 'ease-out':
      return cb(0, 0, 0.58, 1);
    case 'ease-in-out':
      return cb(0.42, 0, 0.58, 1);
    case 'ease-in-cubic':
      return cb(0.55, 0.055, 0.675, 0.19);
    case 'ease-out-cubic':
      return cb(0.215, 0.61, 0.355, 1);
    case 'ease-in-out-cubic':
      return cb(0.645, 0.045, 0.355, 1);
    case 'ease-in-expo':
      return cb(0.95, 0.05, 0.795, 0.035);
    case 'ease-out-expo':
      return cb(0.19, 1, 0.22, 1);
    case 'ease-in-out-expo':
      return cb(1, 0, 0, 1);
    case 'ease-in-back':
      return cb(0.6, -0.28, 0.735, 0.045);
    case 'ease-out-back':
      return cb(0.175, 0.885, 0.32, 1.275);
    case 'ease-in-out-back':
      return cb(0.68, -0.55, 0.265, 1.55);
    case 'bounce':
      return cb(0.34, 1.56, 0.64, 1);
    case 'spring':
      return cb(0.25, 1.33, 0.35, 1);
    case 'ease-out-elastic':
      return cb(0.22, 1.36, 0.42, 1);
  }
}

creator.ui.onMessage(async (msg: UIToPluginMessage & { messageId?: string }) => {
  switch (msg.type) {
    case 'ui-ready': {
      sendTheme();
      break;
    }

    case 'get-scene-info': {
      const scene = creator.activeScene;
      creator.ui.postMessage({
        type: 'scene-info',
        data: {
          framerate: scene ? scene.framerate : 30,
          duration: scene ? scene.duration : 5,
        },
        messageId: msg.messageId,
      });
      break;
    }

    case 'insert-qr': {
      try {
        const { layers, animationConfig } = msg.data;
        const scene = creator.activeScene;
        const sceneSize = scene ? scene.size : { width: 512, height: 512 };
        const sceneCenter = { x: sceneSize.width / 2, y: sceneSize.height / 2 };

        // Generate per-layer animation keyframes
        const layerKeyframes = generateLayerKeyframes(animationConfig, layers.length);
        const easing = getEasingConfig(animationConfig.easing);

        for (const qrLayer of layers) {
          // Import this layer's SVG
          const layer = await scene.import({ animation: qrLayer.svgString });
          layer.name = layers.length === 1 ? 'QR Code' : `QR Code (${qrLayer.groupIndex + 1})`;

          // Scale and center (identical for all layers so they overlay)
          const importedSize =
            layer.type === 'SCENE_LAYER'
              ? layer.scene.size
              : { width: layer.image.width, height: layer.image.height };

          const targetSize = Math.min(sceneSize.width, sceneSize.height) * 0.6;
          const importScale = Math.min(
            targetSize / importedSize.width,
            targetSize / importedSize.height,
          );
          layer.scale.staticValue = { x: importScale * 100, y: importScale * 100 };

          const basePosition = { x: sceneCenter.x, y: sceneCenter.y };
          layer.position.staticValue = basePosition;

          // Find the matching keyframes for this layer's group
          const kfSet = layerKeyframes.find((lk) => lk.groupIndex === qrLayer.groupIndex);
          if (!kfSet) continue;

          const { keyframes } = kfSet;

          // Opacity keyframes
          layer.opacity.addKeyframes(
            keyframes.opacity.map((kf) => ({
              frame: kf.frame,
              value: kf.value,
              ...(easing ? { easing } : {}),
            })),
          );

          // Scale keyframes — compose with import scale
          if (keyframes.scale) {
            layer.scale.addKeyframes(
              keyframes.scale.map((kf) => ({
                frame: kf.frame,
                value: {
                  x: (importScale * 100 * kf.value.x) / 100,
                  y: (importScale * 100 * kf.value.y) / 100,
                },
                ...(easing ? { easing } : {}),
              })),
            );
          }

          // Position keyframes — offset from base position
          if (keyframes.position) {
            layer.position.addKeyframes(
              keyframes.position.map((kf) => ({
                frame: kf.frame,
                value: {
                  x: basePosition.x + kf.value.x,
                  y: basePosition.y + kf.value.y,
                },
                ...(easing ? { easing } : {}),
              })),
            );
          }

          // Rotation keyframes
          if (keyframes.rotation) {
            layer.rotation.addKeyframes(
              keyframes.rotation.map((kf) => ({
                frame: kf.frame,
                value: kf.value,
                ...(easing ? { easing } : {}),
              })),
            );
          }
        }

        // Extend scene duration if animation exceeds it
        const framerate = scene ? scene.framerate : 30;
        const animDurationSec = animationConfig.durationFrames / framerate;
        if (scene && animDurationSec > scene.duration) {
          scene.duration = animDurationSec;
        }

        creator.ui.postMessage({
          type: 'insert-qr-result',
          data: { success: true },
          messageId: msg.messageId,
        });
      } catch (error) {
        creator.ui.postMessage({
          type: 'insert-qr-result',
          data: {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to insert QR code',
          },
          messageId: msg.messageId,
        });
      }
      break;
    }
  }
});

creator.on('theme:change', () => {
  sendTheme();
});
