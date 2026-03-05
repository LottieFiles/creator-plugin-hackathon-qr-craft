# eventStoreUtils.ts Template

Copy this file to `src/utils/eventStoreUtils.ts`.

Provides `initializeEventTracker()` and `fireEvent()` for Creator Plugin analytics.

Prerequisites:
- `@lottiefiles/event-store` and `@lottiefiles/plugin-tracker` installed
- `APP_NAME` and `APP_VERSION` Vite define globals
- `.env.development` and `.env.production` with `VITE_EVENTSTORE_*` and `VITE_PLUGIN_TRACKER_*` keys
- (Optional) `pluginMessage()` helper — only needed if tracking user IDs (see SKILL.md step 5)

```typescript
import { getEventStoreInstance, initializeEventStore } from '@lottiefiles/event-store';
import { getTracker, initializeTracker, track } from '@lottiefiles/plugin-tracker';

import { pluginMessage } from '.'; // Optional — remove if not tracking user IDs
import type { EventType } from '../data/eventStore';

type EventTracker = 'event-store' | 'plugin-tracker';

export const EVENT_TRACKER = 'event-store' as EventTracker;

const LogLevel = {
  None: 0,
  Error: 1,
  Warn: 2,
  Verbose: 3,
  Debug: 4,
} as const;

const AMPLITUDE_OPTIONS = {
  deviceManufacturer: true,
  deviceModel: true,
  ipAddress: true,
  language: true,
  osName: true,
  osVersion: true,
} as const;

const PLUGIN_TRACKER_API_KEY = import.meta.env.VITE_PLUGIN_TRACKER_API_KEY;
const EVENT_STORE_API_KEY = import.meta.env.VITE_EVENTSTORE_API_KEY;
const EVENT_STORE_HOST = import.meta.env.VITE_EVENTSTORE_HOST;

export const initializeEventTracker = async () => {
  try {
    // Optional — remove these two lines if not tracking user IDs
    const userId = await pluginMessage({ type: 'get-user-id' });

    if (EVENT_TRACKER === 'plugin-tracker') {
      await initializeTracker(PLUGIN_TRACKER_API_KEY, {
        ...AMPLITUDE_OPTIONS,
        platform: APP_NAME,
        appVersion: APP_VERSION,
      });
      if (userId) getTracker().setUserId(userId); // Optional — remove if not tracking user IDs
      return;
    }

    const eventStoreParams = {
      key: EVENT_STORE_API_KEY,
      tracking_host: EVENT_STORE_HOST,
      // These two options need to be set as cookie/localStorage isn't available in sandboxed UI iframe
      // - `cookie_policy: strict` Jitsu won't store or access cookies
      // - `disable_event_persistence: true` Jitsu won't use localStorage to persist failed events
      cookie_policy: 'strict',
      disable_event_persistence: true,
    } as const;

    const additionalClients = {
      amplitude: {
        enabled: true,
        logLevel: import.meta.env.PROD ? LogLevel.None : LogLevel.Warn,
        amplitudeTrackingOptions: {
          ...AMPLITUDE_OPTIONS,
        },
        defaultTrackingOptions: {
          pageViews: false,
          sessions: true,
          formInteractions: false,
          fileDownloads: false,
        },
      },
    };

    const eventStore = initializeEventStore(eventStoreParams, additionalClients);
    if (userId) eventStore.initEventStore({ userIdentity: { id: userId } }); // Optional — remove if not tracking user IDs
  } catch (error) {
    console.warn('Failed to initialize event tracker:', error);
  }
};

interface EventStorePayload {
  eventType: EventType;
  parameters: {};
}

export const fireEvent = ({ eventType, parameters }: EventStorePayload): void => {
  try {
    if (EVENT_TRACKER === 'plugin-tracker') {
      track({ name: eventType, props: { ...parameters } });
      return;
    }

    const eventStore = getEventStoreInstance();

    eventStore.sendEvents(
      eventType,
      // Jitsu Payload
      {
        client: {
          name: APP_NAME,
          version: APP_VERSION,
        },
        ...parameters,
      },
      // Amplitude Payload
      {
        name: eventType,
        eventProperties: { ...parameters },
      },
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes(`Failed to read the 'cookie' property from 'Document'`)) {
      // even though the event store has been initialized with strict cookie policy, it still seems to try to access cookies
      // the event still fires, so we're ignoring this error
      return;
    }

    console.warn('Failed to fire event:', err);
  }
};
```
