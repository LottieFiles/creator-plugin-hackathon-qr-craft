---
name: creator-event-tracking
description: |
  This skill should be used when adding analytics or event tracking to a Creator Plugin.
  It applies when (1) setting up event tracking in a new plugin, (2) adding new tracked events
  to an existing plugin, (3) the user mentions "event store", "analytics", "tracking", "telemetry",
  or "fireEvent" in a plugin context. Internal use for LottieFiles plugins only.
  When setting up tracking, ask the user if they want to track the user ID (steps 5 and 7 are optional).
---

# Creator Plugin Event Tracking

Event tracking in Creator Plugins uses `@lottiefiles/event-store` (Jitsu + Amplitude). Events fire from **UI code only** — the plugin sandbox cannot make network requests.

## Architecture

```
UI (src/)                          Plugin Sandbox (plugin/)
─────────────────                  ────────────────────────
initializeEventTracker()           (optional) handles 'get-user-id' →
  configures Jitsu + Amplitude       responds with creator.user?.id
  (optional) requests user ID

fireEvent({ eventType, params })
  → sends to Jitsu host
  → sends to Amplitude
```

## File Structure

A plugin with event tracking has these files:

```text
my-plugin/
├── src/
│   ├── data/
│   │   └── eventStore.ts              # Event type constants + parameter interfaces
│   ├── utils/
│   │   └── eventStoreUtils.ts         # initializeEventTracker() + fireEvent()
│   └── main.tsx                       # Calls initializeEventTracker() on startup
├── .env.development                   # Dev API keys + host
└── .env.production                    # Prod API keys + host
```

## Setup Steps

### 1. Install dependencies

```bash
pnpm add @lottiefiles/event-store @lottiefiles/plugin-tracker
```

### 2. Copy environment files

Copy `.env.development` and `.env.production` from an existing plugin. All internal plugins share the same keys:

```
VITE_EVENTSTORE_API_KEY=...
VITE_EVENTSTORE_HOST=https://events.lottiefiles.dev   # .com for production
VITE_PLUGIN_TRACKER_API_KEY=...
```

### 3. Ensure Vite defines APP_NAME and APP_VERSION

In `vite.config.ts`, the `define` block must include:

```typescript
import packageJSON from './package.json';

export default defineConfig({
  define: {
    APP_NAME: JSON.stringify(packageJSON.name),
    APP_VERSION: JSON.stringify(packageJSON.version),
  },
  // ...plugins
});
```

### 4. Create eventStoreUtils.ts

Copy the template from `references/eventStoreUtils-template.md` to `src/utils/eventStoreUtils.ts`.

This file provides:
- `initializeEventTracker()` — configures Jitsu with strict cookie policy (required for sandboxed iframe) and Amplitude, then sets the user ID
- `fireEvent()` — sends events to both Jitsu and Amplitude backends

### 5. (Optional) Set up user ID tracking

Skip this step if the user doesn't need to associate events with a user ID. If they do:

First, ensure `plugin/manifest.json` includes the `"user"` permission — without it, `creator.user` will be `undefined`:

```json
{
  "permissions": ["user"]
}
```

The `eventStoreUtils.ts` template imports a `pluginMessage` helper from `'.'` — most plugins already have this in `src/utils/index.ts`. Add `get-user-id` to the `Message` type if it's not already there:

```typescript
type Message =
  | { type: 'get-user-id'; output: string | undefined }
  // ...other message types
```

If the plugin doesn't have a `pluginMessage` utility yet, copy the pattern from an existing plugin's `src/utils/index.ts`.

### 6. Define event types

Create `src/data/eventStore.ts` with your event constants and parameter interfaces. See `references/event-definitions-example.md` for examples.

Conventions:

- Every event should have a typed parameter interface
- Match the naming convention used by your plugin's existing events

### 7. (Optional) Handle get-user-id in plugin sandbox

Skip this step if not tracking user IDs (see step 5). Otherwise, the plugin sandbox must respond to the `get-user-id` message:

```typescript
// plugin/plugin.ts
creator.ui.onMessage((msg: any) => {
  if (msg.type === 'get-user-id') {
    creator.ui.postMessage({
      type: 'get-user-id',
      data: creator.user?.id,
    });
    return;
  }
  // ...other message handlers
});
```

### 8. Initialize on startup

In `src/main.tsx`, call `initializeEventTracker()` before rendering:

```typescript
import { initializeEventTracker } from './utils/eventStoreUtils';

const main = async () => {
  await initializeEventTracker();
  // ...render app
};

main();
```

### 9. Fire events

```typescript
import { fireEvent } from './utils/eventStoreUtils';
import { EventType } from '../data/eventStore';

fireEvent({
  eventType: EventType.LogoImported,
  parameters: {
    logo_id: 42,
    logo_title: 'GitHub',
    logo_category: 'Development',
  },
});
```

## Common Pitfalls

1. **Cookie errors in sandboxed iframe** — The event store catch block handles `Failed to read the 'cookie' property from 'Document'`. Events still fire despite this error. Do not remove the try/catch.
2. **Missing .env files** — Without `VITE_EVENTSTORE_API_KEY` and `VITE_EVENTSTORE_HOST`, initialization silently fails. Copy from an existing plugin.
3. **Calling fireEvent before init** — `initializeEventTracker()` must complete before any `fireEvent()` calls. Initialize in `main.tsx` before rendering.
4. **Tracking from plugin sandbox** — Event tracking only works in UI code (`src/`). The plugin sandbox cannot make network requests.

## Reference Files

| Reference | Contents |
| --- | --- |
| `references/eventStoreUtils-template.md` | Complete eventStoreUtils.ts implementation to copy into new plugins |
| `references/event-definitions-example.md` | Example eventStore.ts with event types and typed parameter interfaces |
