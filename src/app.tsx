import { useRef, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, ThemeProvider } from '@lottiefiles/creator-plugins-ui';
import { useQRState } from './hooks/use-qr-state.ts';
import { useTheme } from './hooks/use-theme.ts';
import { QRPreview } from './components/qr-preview.tsx';
import type { QRPreviewHandle } from './components/qr-preview.tsx';
import { ActionBar } from './components/action-bar.tsx';
import { DesignTab } from './components/tabs/design-tab.tsx';
import { AnimateTab } from './components/tabs/animate-tab.tsx';
import { renderQRSvgLayers } from './utils/svg-renderer.ts';
import { sendToPluginAsync } from './utils/messaging.ts';

export function App() {
  const { qrConfig, updateQRConfig, animationConfig, updateAnimationConfig } = useQRState();
  const { themeTokens, themeName } = useTheme();
  const previewRef = useRef<QRPreviewHandle>(null);
  const [framerate, setFramerate] = useState(30);
  const [activeTab, setActiveTab] = useState('design');

  useEffect(() => {
    sendToPluginAsync({ type: 'get-scene-info' }, 'scene-info').then((msg) => {
      setFramerate(msg.data.framerate);
    });
  }, []);

  return (
    <ThemeProvider tokens={themeTokens} themeName={themeName}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <QRPreview
          ref={previewRef}
          config={qrConfig}
          animationConfig={animationConfig}
          isAnimateTab={activeTab === 'animate'}
          framerate={framerate}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="px-3 pt-2">
              <TabsTrigger value="design" size="sm">Design</TabsTrigger>
              <TabsTrigger value="animate" size="sm">Animate</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="design">
                <DesignTab config={qrConfig} onUpdate={updateQRConfig} />
              </TabsContent>

              <TabsContent value="animate">
                <AnimateTab
                  config={animationConfig}
                  onUpdate={updateAnimationConfig}
                  framerate={framerate}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <ActionBar
          getQRLayers={() => renderQRSvgLayers(qrConfig, animationConfig.revealStyle)}
          animationConfig={animationConfig}
        />
      </div>
    </ThemeProvider>
  );
}
