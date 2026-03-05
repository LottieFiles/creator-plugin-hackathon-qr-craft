import type { UIToPluginMessage, PluginToUIMessage } from '../../shared/types.ts';

export function sendToPlugin(message: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function sendToPluginAsync<T extends PluginToUIMessage['type']>(
  message: UIToPluginMessage,
  responseType: T,
): Promise<Extract<PluginToUIMessage, { type: T }>> {
  return new Promise((resolve) => {
    const messageId = Math.random().toString(36).substring(2);

    parent.postMessage({ pluginMessage: { ...message, messageId } }, '*');

    const listener = (event: MessageEvent<{ pluginMessage: PluginToUIMessage & { messageId?: string } }>) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === responseType && msg && 'messageId' in msg && msg.messageId === messageId) {
        resolve(msg as Extract<PluginToUIMessage, { type: T }>);
        window.removeEventListener('message', listener);
      }
    };

    window.addEventListener('message', listener);
  });
}

export function onPluginMessage<T extends PluginToUIMessage['type']>(
  type: T,
  callback: (msg: Extract<PluginToUIMessage, { type: T }>) => void,
): () => void {
  const listener = (event: MessageEvent<{ pluginMessage: PluginToUIMessage }>) => {
    const msg = event.data.pluginMessage;
    if (msg?.type === type) {
      callback(msg as Extract<PluginToUIMessage, { type: T }>);
    }
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}
