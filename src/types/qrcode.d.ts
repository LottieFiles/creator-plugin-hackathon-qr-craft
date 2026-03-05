declare module 'qrcode' {
  interface QRCodeModules {
    size: number;
    data: Uint8Array;
  }

  interface QRCodeResult {
    modules: QRCodeModules;
    version: number;
    errorCorrectionLevel: { bit: number };
    maskPattern: number;
  }

  interface CreateOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  function create(text: string, options?: CreateOptions): QRCodeResult;

  export default { create };
}
