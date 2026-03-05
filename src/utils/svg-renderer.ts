import type { QRConfig, QRLayer, RevealStyle, CornerDotStyle } from '../../shared/types.ts';
import { generateQRMatrix, isInFinderPattern } from './qr-matrix.ts';

function buildGradientDefs(config: QRConfig): string {
  if (!config.useGradient) return '';

  let defs = '';

  // Main dot gradient
  if (config.gradientType === 'linear') {
    defs += `<linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.gradientStart}" />
        <stop offset="100%" stop-color="${config.gradientEnd}" />
      </linearGradient>`;
  } else {
    defs += `<radialGradient id="qr-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${config.gradientStart}" />
        <stop offset="100%" stop-color="${config.gradientEnd}" />
      </radialGradient>`;
  }

  // Separate corner gradient
  if (config.useCornerGradient) {
    if (config.cornerGradientType === 'linear') {
      defs += `\n<linearGradient id="qr-corner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.cornerGradientStart}" />
        <stop offset="100%" stop-color="${config.cornerGradientEnd}" />
      </linearGradient>`;
    } else {
      defs += `\n<radialGradient id="qr-corner-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${config.cornerGradientStart}" />
        <stop offset="100%" stop-color="${config.cornerGradientEnd}" />
      </radialGradient>`;
    }
  }

  return defs;
}

function getDualFills(config: QRConfig): { dotFill: string; cornerFill: string } {
  const dotFill = config.useGradient ? 'url(#qr-gradient)' : config.fgColor;
  const cornerFill =
    config.useGradient && config.useCornerGradient
      ? 'url(#qr-corner-gradient)'
      : dotFill;
  return { dotFill, cornerFill };
}

export function renderQRSvg(config: QRConfig): string {
  const matrix = generateQRMatrix(config.text || 'https://lottiefiles.com', config.errorCorrection);
  const moduleCount = matrix.size;
  const moduleSize = config.size / moduleCount;
  const parts: string[] = [];

  const gradientDefs = buildGradientDefs(config);
  const { dotFill, cornerFill } = getDualFills(config);

  // Render data modules (non-finder-pattern)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix.modules[row]![col]) continue;
      if (isInFinderPattern(row, col, matrix.finderPatternRegions)) continue;

      // Skip logo cutout area
      if (config.logoDataUrl && isInLogoCutout(row, col, moduleCount, config.logoSizePercent)) {
        continue;
      }

      const x = col * moduleSize;
      const y = row * moduleSize;
      parts.push(renderDot(x, y, moduleSize, config.dotStyle, dotFill));
    }
  }

  // Render finder patterns with corner style
  for (const region of matrix.finderPatternRegions) {
    parts.push(renderFinderPattern(region.row, region.col, moduleSize, config.cornerStyle, cornerFill, config.bgColor, config.cornerDotStyle));
  }

  // Logo overlay
  let logoSvg = '';
  if (config.logoDataUrl) {
    const logoSize = config.size * (config.logoSizePercent / 100);
    const logoOffset = (config.size - logoSize) / 2;
    logoSvg = `<image href="${config.logoDataUrl}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.size} ${config.size}" width="${config.size}" height="${config.size}">
${gradientDefs ? `<defs>${gradientDefs}</defs>` : ''}
<rect width="${config.size}" height="${config.size}" fill="${config.bgColor}" />
${parts.join('\n')}
${logoSvg}
</svg>`;
}

/**
 * Split the QR code into multiple SVG layers based on the reveal style.
 * Each layer has the same viewBox so they overlay perfectly when imported.
 */
export function renderQRSvgLayers(config: QRConfig, revealStyle: RevealStyle): QRLayer[] {
  // Single-layer styles: return full SVG as one layer
  const singleLayerStyles: RevealStyle[] = [
    'fade-in', 'drop-in', 'bounce-in', 'spin-in', 'glitch', 'zoom-out', 'elastic-snap',
  ];
  if (singleLayerStyles.includes(revealStyle)) {
    return [{ svgString: renderQRSvg(config), groupIndex: 0 }];
  }

  const matrix = generateQRMatrix(config.text || 'https://lottiefiles.com', config.errorCorrection);
  const moduleCount = matrix.size;
  const moduleSize = config.size / moduleCount;

  const gradientDefs = buildGradientDefs(config);
  const { dotFill, cornerFill } = getDualFills(config);

  // Determine number of groups per style
  const groupCounts: Partial<Record<RevealStyle, number>> = {
    'pixel-scatter': 14,
    'diagonal-wipe': 10,
    'checkerboard': 2,
    'quadrant-reveal': 4,
    'typewriter': 20,
    'ripple': 10,
  };
  const numGroups = groupCounts[revealStyle] ?? 8;

  // Build module → group assignment
  const moduleGroups: number[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    moduleGroups.push([]);
    for (let col = 0; col < moduleCount; col++) {
      moduleGroups[row]!.push(assignGroup(row, col, moduleCount, revealStyle, numGroups));
    }
  }

  // Collect SVG parts per group
  const groupParts: string[][] = Array.from({ length: numGroups }, () => []);

  // Assign data modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix.modules[row]![col]) continue;
      if (isInFinderPattern(row, col, matrix.finderPatternRegions)) continue;
      if (config.logoDataUrl && isInLogoCutout(row, col, moduleCount, config.logoSizePercent)) continue;

      const group = moduleGroups[row]![col]!;
      const x = col * moduleSize;
      const y = row * moduleSize;
      groupParts[group]!.push(renderDot(x, y, moduleSize, config.dotStyle, dotFill));
    }
  }

  // Assign finder patterns as a unit based on top-left corner's group
  for (const region of matrix.finderPatternRegions) {
    const group = moduleGroups[region.row]![region.col]!;
    groupParts[group]!.push(
      renderFinderPattern(region.row, region.col, moduleSize, config.cornerStyle, cornerFill, config.bgColor, config.cornerDotStyle),
    );
  }

  // Find the last non-empty group for logo placement
  let lastGroup = numGroups - 1;
  while (lastGroup > 0 && groupParts[lastGroup]!.length === 0) {
    lastGroup--;
  }

  // Build SVG for each non-empty group
  const layers: QRLayer[] = [];
  for (let g = 0; g < numGroups; g++) {
    if (groupParts[g]!.length === 0) continue;

    const isFirstGroup = g === 0;
    const isLastGroup = g === lastGroup;

    // Background rect only in group 0
    const bgRect = isFirstGroup
      ? `<rect width="${config.size}" height="${config.size}" fill="${config.bgColor}" />`
      : '';

    // Logo overlay only in the last group
    let logoSvg = '';
    if (isLastGroup && config.logoDataUrl) {
      const logoSize = config.size * (config.logoSizePercent / 100);
      const logoOffset = (config.size - logoSize) / 2;
      logoSvg = `<image href="${config.logoDataUrl}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.size} ${config.size}" width="${config.size}" height="${config.size}">
${gradientDefs ? `<defs>${gradientDefs}</defs>` : ''}
${bgRect}
${groupParts[g]!.join('\n')}
${logoSvg}
</svg>`;

    layers.push({ svgString: svg, groupIndex: g });
  }

  return layers;
}

/**
 * Render QR as a single SVG with <g class="qr-group-N"> elements for CSS animation.
 * Background and logo sit outside groups (always visible).
 */
export function renderQRSvgGrouped(
  config: QRConfig,
  revealStyle: RevealStyle,
): { svgString: string; groupCount: number } {
  const singleLayerStyles: RevealStyle[] = [
    'fade-in', 'drop-in', 'bounce-in', 'spin-in', 'glitch', 'zoom-out', 'elastic-snap',
  ];

  // For single-layer styles, wrap everything in one group
  if (singleLayerStyles.includes(revealStyle)) {
    const svg = renderQRSvg(config);
    // Wrap the inner content (after opening <svg> tag) in a group
    const openTagEnd = svg.indexOf('>') + 1;
    const closeTagStart = svg.lastIndexOf('</svg>');
    const inner = svg.slice(openTagEnd, closeTagStart);
    const grouped = svg.slice(0, openTagEnd) + `<g class="qr-group-0">${inner}</g>` + svg.slice(closeTagStart);
    return { svgString: grouped, groupCount: 1 };
  }

  const matrix = generateQRMatrix(config.text || 'https://lottiefiles.com', config.errorCorrection);
  const moduleCount = matrix.size;
  const moduleSize = config.size / moduleCount;

  const gradientDefs = buildGradientDefs(config);
  const { dotFill, cornerFill } = getDualFills(config);

  const groupCounts: Partial<Record<RevealStyle, number>> = {
    'pixel-scatter': 14,
    'diagonal-wipe': 10,
    'checkerboard': 2,
    'quadrant-reveal': 4,
    'typewriter': 20,
    'ripple': 10,
  };
  const numGroups = groupCounts[revealStyle] ?? 8;

  const moduleGroups: number[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    moduleGroups.push([]);
    for (let col = 0; col < moduleCount; col++) {
      moduleGroups[row]!.push(assignGroup(row, col, moduleCount, revealStyle, numGroups));
    }
  }

  const groupParts: string[][] = Array.from({ length: numGroups }, () => []);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix.modules[row]![col]) continue;
      if (isInFinderPattern(row, col, matrix.finderPatternRegions)) continue;
      if (config.logoDataUrl && isInLogoCutout(row, col, moduleCount, config.logoSizePercent)) continue;

      const group = moduleGroups[row]![col]!;
      const x = col * moduleSize;
      const y = row * moduleSize;
      groupParts[group]!.push(renderDot(x, y, moduleSize, config.dotStyle, dotFill));
    }
  }

  for (const region of matrix.finderPatternRegions) {
    const group = moduleGroups[region.row]![region.col]!;
    groupParts[group]!.push(
      renderFinderPattern(region.row, region.col, moduleSize, config.cornerStyle, cornerFill, config.bgColor, config.cornerDotStyle),
    );
  }

  // Build grouped SVG elements
  const groupElements = groupParts
    .map((parts, g) => {
      if (parts.length === 0) return '';
      return `<g class="qr-group-${g}">\n${parts.join('\n')}\n</g>`;
    })
    .filter(Boolean)
    .join('\n');

  let logoSvg = '';
  if (config.logoDataUrl) {
    const logoSize = config.size * (config.logoSizePercent / 100);
    const logoOffset = (config.size - logoSize) / 2;
    logoSvg = `<image href="${config.logoDataUrl}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" />`;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.size} ${config.size}" width="${config.size}" height="${config.size}">
${gradientDefs ? `<defs>${gradientDefs}</defs>` : ''}
<rect width="${config.size}" height="${config.size}" fill="${config.bgColor}" />
${groupElements}
${logoSvg}
</svg>`;

  const actualGroupCount = groupParts.filter((p) => p.length > 0).length;
  return { svgString, groupCount: actualGroupCount };
}

function assignGroup(
  row: number,
  col: number,
  moduleCount: number,
  style: RevealStyle,
  numGroups: number,
): number {
  switch (style) {
    case 'row-sweep': {
      const rowsPerGroup = Math.ceil(moduleCount / numGroups);
      return Math.min(Math.floor(row / rowsPerGroup), numGroups - 1);
    }
    case 'spiral-reveal': {
      // Chebyshev distance from center → concentric rings, outermost first
      const centerRow = (moduleCount - 1) / 2;
      const centerCol = (moduleCount - 1) / 2;
      const dist = Math.max(Math.abs(row - centerRow), Math.abs(col - centerCol));
      const maxDist = Math.max(centerRow, centerCol);
      const ringsPerGroup = Math.ceil((maxDist + 1) / numGroups);
      const ring = Math.floor(dist / ringsPerGroup);
      return Math.min(numGroups - 1 - ring, numGroups - 1);
    }
    case 'pixel-scatter': {
      const hash = ((row * 31 + col * 17) * 2654435761) >>> 0;
      return hash % numGroups;
    }
    case 'column-sweep':
    case 'rain': {
      const colsPerGroup = Math.ceil(moduleCount / numGroups);
      return Math.min(Math.floor(col / colsPerGroup), numGroups - 1);
    }
    case 'diagonal-wipe': {
      const maxDiag = (moduleCount - 1) * 2;
      const bandSize = Math.ceil((maxDiag + 1) / numGroups);
      return Math.min(Math.floor((row + col) / bandSize), numGroups - 1);
    }
    case 'checkerboard': {
      const blockSize = Math.max(1, Math.ceil(moduleCount / 6));
      return (Math.floor(row / blockSize) + Math.floor(col / blockSize)) % 2;
    }
    case 'quadrant-reveal': {
      const half = moduleCount / 2;
      if (row < half && col < half) return 0;
      if (row < half && col >= half) return 1;
      if (row >= half && col < half) return 2;
      return 3;
    }
    case 'typewriter': {
      const totalModules = moduleCount * moduleCount;
      const modulesPerGroup = Math.ceil(totalModules / numGroups);
      const seqIndex = row * moduleCount + col;
      return Math.min(Math.floor(seqIndex / modulesPerGroup), numGroups - 1);
    }
    case 'ripple': {
      // Euclidean distance from center → circular rings
      const cx = (moduleCount - 1) / 2;
      const cy = (moduleCount - 1) / 2;
      const eucDist = Math.sqrt((row - cx) ** 2 + (col - cy) ** 2);
      const maxEucDist = Math.sqrt(cx ** 2 + cy ** 2);
      const ringsPerGroup = Math.ceil((maxEucDist + 1) / numGroups);
      // Center first (group 0), outermost last
      return Math.min(Math.floor(eucDist / ringsPerGroup), numGroups - 1);
    }
    default:
      return 0;
  }
}

function isInLogoCutout(
  row: number,
  col: number,
  moduleCount: number,
  logoSizePercent: number,
): boolean {
  const logoModules = Math.ceil(moduleCount * (logoSizePercent / 100));
  const start = Math.floor((moduleCount - logoModules) / 2);
  const end = start + logoModules;
  return row >= start && row < end && col >= start && col < end;
}

function renderDot(
  x: number,
  y: number,
  size: number,
  style: QRConfig['dotStyle'],
  fill: string,
): string {
  const gap = size * 0.1;
  const s = size - gap;
  const offset = gap / 2;

  switch (style) {
    case 'square':
      return `<rect x="${x + offset}" y="${y + offset}" width="${s}" height="${s}" fill="${fill}" />`;
    case 'rounded':
      return `<rect x="${x + offset}" y="${y + offset}" width="${s}" height="${s}" rx="${s * 0.3}" fill="${fill}" />`;
    case 'circle':
      return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${s / 2}" fill="${fill}" />`;
    case 'diamond': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const half = s / 2;
      return `<polygon points="${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}" fill="${fill}" />`;
    }
    case 'cross': {
      const arm = s * 0.3;
      const cx = x + offset;
      const cy = y + offset;
      const mid = (s - arm) / 2;
      return `<rect x="${cx + mid}" y="${cy}" width="${arm}" height="${s}" fill="${fill}" /><rect x="${cx}" y="${cy + mid}" width="${s}" height="${arm}" fill="${fill}" />`;
    }
    case 'star': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const outerR = s / 2;
      const innerR = outerR * 0.4;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="${fill}" />`;
    }
    case 'hexagon': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = s / 2;
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="${fill}" />`;
    }
    case 'classy': {
      const cx = x + offset;
      const cy = y + offset;
      const r = s * 0.4;
      return `<path d="M${cx + r},${cy} L${cx + s},${cy} L${cx + s},${cy + s - r} Q${cx + s},${cy + s} ${cx + s - r},${cy + s} L${cx},${cy + s} L${cx},${cy + r} Q${cx},${cy} ${cx + r},${cy} Z" fill="${fill}" />`;
    }
    case 'heart': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const hs = s / 2;
      return `<path d="M${cx},${cy + hs * 0.7} C${cx - hs * 1.2},${cy - hs * 0.2} ${cx - hs * 0.6},${cy - hs * 0.9} ${cx},${cy - hs * 0.3} C${cx + hs * 0.6},${cy - hs * 0.9} ${cx + hs * 1.2},${cy - hs * 0.2} ${cx},${cy + hs * 0.7} Z" fill="${fill}" />`;
    }
    case 'ring': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const strokeW = s * 0.2;
      return `<circle cx="${cx}" cy="${cy}" r="${(s - strokeW) / 2}" fill="none" stroke="${fill}" stroke-width="${strokeW}" />`;
    }
  }
}

function renderCornerDot(
  x: number,
  y: number,
  size: number,
  style: CornerDotStyle,
  fill: string,
): string {
  switch (style) {
    case 'square':
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" />`;
    case 'rounded':
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.2}" fill="${fill}" />`;
    case 'circle': {
      const r = size / 2;
      return `<circle cx="${x + r}" cy="${y + r}" r="${r}" fill="${fill}" />`;
    }
    case 'diamond': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const half = size / 2;
      return `<polygon points="${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}" fill="${fill}" />`;
    }
    case 'star': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const outerR = size / 2;
      const innerR = outerR * 0.4;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="${fill}" />`;
    }
    case 'heart': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const hs = size / 2;
      return `<path d="M${cx},${cy + hs * 0.7} C${cx - hs * 1.2},${cy - hs * 0.2} ${cx - hs * 0.6},${cy - hs * 0.9} ${cx},${cy - hs * 0.3} C${cx + hs * 0.6},${cy - hs * 0.9} ${cx + hs * 1.2},${cy - hs * 0.2} ${cx},${cy + hs * 0.7} Z" fill="${fill}" />`;
    }
  }
}

function renderFinderRects(
  x: number,
  y: number,
  moduleSize: number,
  rxOuter: number,
  rxMiddle: number,
  fill: string,
  bgColor: string,
): string {
  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const mo = moduleSize;
  return `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${rxOuter}" fill="${fill}" />
<rect x="${x + mo}" y="${y + mo}" width="${middleSize}" height="${middleSize}" rx="${rxMiddle}" fill="${bgColor}" />`;
}

function renderFinderPattern(
  startRow: number,
  startCol: number,
  moduleSize: number,
  cornerStyle: QRConfig['cornerStyle'],
  fill: string,
  bgColor: string,
  cornerDotStyle: CornerDotStyle,
): string {
  const x = startCol * moduleSize;
  const y = startRow * moduleSize;
  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;
  const mo = moduleSize;
  const io = 2 * moduleSize;

  // Inner dot position and size
  const innerX = x + io;
  const innerY = y + io;
  const innerDot = renderCornerDot(innerX, innerY, innerSize, cornerDotStyle, fill);

  switch (cornerStyle) {
    case 'square':
      return renderFinderRects(x, y, moduleSize, 0, 0, fill, bgColor) + '\n' + innerDot;
    case 'rounded':
      return renderFinderRects(x, y, moduleSize, moduleSize * 0.8, moduleSize * 0.6, fill, bgColor) + '\n' + innerDot;
    case 'circle':
      return renderFinderRects(x, y, moduleSize, outerSize / 2, middleSize / 2, fill, bgColor) + '\n' + innerDot;
    case 'extra-rounded':
      return renderFinderRects(x, y, moduleSize, moduleSize * 1.6, moduleSize * 1.2, fill, bgColor) + '\n' + innerDot;
    case 'dot':
      // Square outer + bg square middle + corner dot inner
      return `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" fill="${fill}" />
<rect x="${x + mo}" y="${y + mo}" width="${middleSize}" height="${middleSize}" fill="${bgColor}" />
${innerDot}`;
    case 'classy': {
      // Top-left + bottom-right rounded, others sharp
      const r = moduleSize * 1.2;
      const outerPath = `M${x + r},${y} L${x + outerSize},${y} L${x + outerSize},${y + outerSize - r} Q${x + outerSize},${y + outerSize} ${x + outerSize - r},${y + outerSize} L${x},${y + outerSize} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;
      const rm = moduleSize * 0.9;
      const mx = x + mo;
      const my = y + mo;
      const middlePath = `M${mx + rm},${my} L${mx + middleSize},${my} L${mx + middleSize},${my + middleSize - rm} Q${mx + middleSize},${my + middleSize} ${mx + middleSize - rm},${my + middleSize} L${mx},${my + middleSize} L${mx},${my + rm} Q${mx},${my} ${mx + rm},${my} Z`;
      return `<path d="${outerPath}" fill="${fill}" /><path d="${middlePath}" fill="${bgColor}" />${innerDot}`;
    }
    case 'leaf': {
      // Top-left + bottom-right rounded (organic leaf feel)
      const r = moduleSize * 1.6;
      const outerPath = `M${x + r},${y} L${x + outerSize},${y} L${x + outerSize},${y + outerSize - r} Q${x + outerSize},${y + outerSize} ${x + outerSize - r},${y + outerSize} L${x},${y + outerSize} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;
      const rm = moduleSize * 1.2;
      const mx = x + mo;
      const my = y + mo;
      const middlePath = `M${mx + rm},${my} L${mx + middleSize},${my} L${mx + middleSize},${my + middleSize - rm} Q${mx + middleSize},${my + middleSize} ${mx + middleSize - rm},${my + middleSize} L${mx},${my + middleSize} L${mx},${my + rm} Q${mx},${my} ${mx + rm},${my} Z`;
      return `<path d="${outerPath}" fill="${fill}" /><path d="${middlePath}" fill="${bgColor}" />${innerDot}`;
    }
  }
}
