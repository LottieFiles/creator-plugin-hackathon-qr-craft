import { useState, useEffect } from 'react';
import { sendToPlugin, onPluginMessage } from '../utils/messaging.ts';

export function useTheme() {
  const [themeTokens, setThemeTokens] = useState<Record<string, string>>({});
  const [themeName, setThemeName] = useState<string | undefined>();

  useEffect(() => {
    sendToPlugin({ type: 'ui-ready' });

    return onPluginMessage('theme-change', (msg) => {
      setThemeTokens(msg.data.tokens);
      setThemeName(msg.data.themeName);
    });
  }, []);

  return { themeTokens, themeName };
}
