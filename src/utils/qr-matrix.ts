import QRCodeLib from 'qrcode';

export interface QRMatrix {
  size: number;
  modules: boolean[][];
  finderPatternRegions: Array<{ row: number; col: number; size: number }>;
}

export function generateQRMatrix(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H',
): QRMatrix {
  const qr = QRCodeLib.create(text, { errorCorrectionLevel });
  const size = qr.modules.size;
  const data = qr.modules.data;

  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowData.push(data[row * size + col] === 1);
    }
    modules.push(rowData);
  }

  // Finder patterns are always 7x7 at three corners
  const finderPatternRegions = [
    { row: 0, col: 0, size: 7 },
    { row: 0, col: size - 7, size: 7 },
    { row: size - 7, col: 0, size: 7 },
  ];

  return { size, modules, finderPatternRegions };
}

export function isInFinderPattern(
  row: number,
  col: number,
  regions: QRMatrix['finderPatternRegions'],
): boolean {
  return regions.some(
    (r) => row >= r.row && row < r.row + r.size && col >= r.col && col < r.col + r.size,
  );
}
