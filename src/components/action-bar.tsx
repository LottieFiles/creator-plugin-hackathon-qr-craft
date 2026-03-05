import { useState } from 'react';
import { Button } from '@lottiefiles/creator-plugins-ui';
import { Download } from 'lucide-react';
import type { AnimationConfig, QRLayer } from '../../shared/types.ts';
import { sendToPluginAsync } from '../utils/messaging.ts';

interface ActionBarProps {
  getQRLayers: () => QRLayer[];
  animationConfig: AnimationConfig;
}

export function ActionBar({ getQRLayers, animationConfig }: ActionBarProps) {
  const [inserting, setInserting] = useState(false);

  const handleInsert = async () => {
    const layers = getQRLayers();
    if (layers.length === 0) return;

    setInserting(true);
    try {
      await sendToPluginAsync(
        { type: 'insert-qr', data: { layers, animationConfig } },
        'insert-qr-result',
      );
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border">
      <Button size="sm" onClick={handleInsert} loading={inserting} className="flex-1 gap-1.5">
        <Download className="size-3.5" />
        Insert to Canvas
      </Button>
    </div>
  );
}
