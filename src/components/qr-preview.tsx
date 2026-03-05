import { useMemo, useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { cn } from '@lottiefiles/creator-plugins-ui';
import { RotateCcw } from 'lucide-react';
import type { QRConfig, AnimationConfig } from '../../shared/types.ts';
import { renderQRSvg, renderQRSvgGrouped } from '../utils/svg-renderer.ts';
import { generateCssAnimation } from '../utils/css-animation.ts';

export interface QRPreviewHandle {
  getSvgString: () => string;
}

interface QRPreviewProps {
  config: QRConfig;
  animationConfig?: AnimationConfig;
  isAnimateTab?: boolean;
  framerate?: number;
}

export const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(function QRPreview(
  { config, animationConfig, isAnimateTab, framerate = 30 },
  ref,
) {
  const staticSvg = useMemo(() => renderQRSvg(config), [config]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useImperativeHandle(ref, () => ({
    getSvgString: () => staticSvg,
  }));

  // Auto-replay when animation config changes
  useEffect(() => {
    if (isAnimateTab && animationConfig) {
      setAnimationKey((k) => k + 1);
    }
  }, [
    isAnimateTab,
    animationConfig?.revealStyle,
    animationConfig?.easing,
    animationConfig?.durationFrames,
  ]);

  const replay = useCallback(() => {
    setAnimationKey((k) => k + 1);
  }, []);

  // Render static SVG
  useEffect(() => {
    if (isAnimateTab) return;
    const container = containerRef.current;
    if (!container) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(staticSvg, 'image/svg+xml');
    const svgElement = doc.documentElement;
    container.replaceChildren(svgElement);
  }, [staticSvg, isAnimateTab]);

  // Render animated SVG
  useEffect(() => {
    if (!isAnimateTab || !animationConfig) return;
    const container = containerRef.current;
    if (!container) return;

    const { svgString, groupCount } = renderQRSvgGrouped(config, animationConfig.revealStyle);
    const { keyframesCSS, groupAnimations } = generateCssAnimation(
      animationConfig,
      groupCount,
      framerate,
    );

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.documentElement;

    // Inject CSS keyframes via <style> element
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = keyframesCSS;
    svgElement.insertBefore(styleEl, svgElement.firstChild);

    // Apply animation styles to each group
    for (const ga of groupAnimations) {
      const groupEl = svgElement.querySelector(`.qr-group-${ga.groupIndex}`);
      if (groupEl) {
        (groupEl as SVGElement).setAttribute('style', ga.style);
      }
    }

    container.replaceChildren(svgElement);
  }, [isAnimateTab, animationConfig, config, framerate, animationKey]);

  return (
    <div className="relative flex items-center justify-center p-4">
      <div
        key={isAnimateTab ? animationKey : 'static'}
        ref={containerRef}
        className="w-[200px] h-[200px] rounded-lg overflow-hidden bg-white shadow-sm [&>svg]:w-full [&>svg]:h-full"
      />
      {isAnimateTab && (
        <button
          type="button"
          onClick={replay}
          className={cn(
            'absolute bottom-5 right-5 p-1.5 rounded-full',
            'bg-background/80 border border-border text-muted-foreground',
            'hover:bg-background hover:text-foreground transition-colors',
          )}
          title="Replay animation"
        >
          <RotateCcw className="size-3.5" />
        </button>
      )}
    </div>
  );
});
