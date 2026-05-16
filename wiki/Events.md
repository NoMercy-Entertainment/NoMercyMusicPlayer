# Events Reference

All events emitted by `NMMusicPlayer<T>`. Use `player.on(eventName, handler)` to subscribe.

---

## Transport events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `play` | `ActionOptions` | Playback starts |
| `pause` | `ActionOptions` | Playback pauses |
| `stop` | `ActionOptions` | Playback stops and position resets |
| `ended` | `void` | Current track finishes naturally |
| `waiting` | `void` | Buffer underrun — player is waiting for data |
| `canplay` | `void` | Enough data buffered to start playing |
| `stalled` | `void` | Data is unavailable for an unexpected period |

`ActionOptions` carries a `source` field (`'user'` | `'auto'` | `'remote'`) identifying what triggered the action.

---

## Time events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `time` | `{ time: number }` | Position updates during playback (rAF-driven) |
| `seeked` | `{ time: number }` | Seek operation completes |
| `duration` | `{ duration: number }` | Duration becomes known |
| `progress` | `{ time: number; duration: number; percentage: number }` | Throttled position update (default every 5s, configurable via `metricsIntervalMs`) |

Use `progress` for server watch-position saves. Use `time` for real-time UI updates (progress bar, time display).

---

## Queue events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `current` | `{ item: T \| undefined; index: number }` | Current track changes |
| `queue` | `ReadonlyArray<T>` | Queue is replaced |
| `queue:append` | `{ items: T[]; index: number }` | Items appended to queue |
| `queue:prepend` | `{ items: T[]; index: number }` | Items prepended to queue |
| `queue:remove` | `{ id: string \| number }` | Item removed from queue |
| `queue:move` | `{ from: number; to: number }` | Item moved within queue |
| `queue:clear` | `void` | Queue cleared |
| `queue:exhausted` | `void` | Queue played through with no repeat active |
| `backlog` | `ReadonlyArray<T>` | Backlog changes |
| `trackEndingSoon` | `{ remaining: number; currentTrack: T }` | Track is ending soon (configurable threshold) |

---

## Playback state events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `shuffle` | `{ state: ShuffleState }` | Shuffle state changes |
| `repeat` | `{ state: RepeatState }` | Repeat state changes |
| `volume` | `{ level: number }` | Volume changes (0–1) |
| `mute` | `{ muted: boolean }` | Mute state changes |
| `phase` | `{ from: PlayerPhase; to: PlayerPhase }` | Player phase transitions |
| `backend:changed` | `{ kind: 'webaudio' \| 'audio-element' }` | Audio backend switches |

---

## Crossfade events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `crossfadeStart` | `{ from: T; to: T; duration: number }` | Crossfade begins |
| `crossfadeComplete` | `{ track: T }` | Crossfade finishes, new track is primary |

---

## Setup and lifecycle events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `ready` | `void` | Player and all plugins have initialized |
| `setupStart` | `void` | Setup pipeline begins |
| `dispose` | `void` | Player is being torn down |
| `firstFrame` | `void` | First audio frame decoded after load |

---

## Error events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `error` | `PlayerErrorEvent` | Recoverable error |
| `fatal` | `PlayerErrorEvent` | Non-recoverable error — playback stopped |
| `warning` | `PlayerErrorEvent` | Non-fatal degradation |

`PlayerErrorEvent` shape:
```ts
interface PlayerErrorEvent {
  code: string;          // e.g. 'stream:hls/manifest-load-failed'
  message: string;
  severity: 'error' | 'fatal' | 'warning';
  cause?: unknown;
  context?: Record<string, unknown>;
}
```

---

## Before events (cancellable)

These fire before an action and can be cancelled or mutated by a listener.

| Event | Payload type | Action |
|-------|-------------|--------|
| `beforePlay` | `BeforeEvent<ActionOptions>` | Cancels play |
| `beforePause` | `BeforeEvent<ActionOptions>` | Cancels pause |
| `beforeStop` | `BeforeEvent<ActionOptions>` | Cancels stop |
| `beforeNext` | `BeforeEvent<ActionOptions>` | Cancels next-track |
| `beforePrevious` | `BeforeEvent<ActionOptions>` | Cancels previous-track |
| `beforeLoad` | `BeforeEvent<{ item: T }>` | Cancels load — replace item to redirect |
| `beforeSeek` | `BeforeEvent<{ time: number }>` | Cancels or adjusts seek target |
| `beforeCrossfade` | `BeforeEvent<{ to: T; opts: CrossfadeOpts }>` | Cancels or adjusts crossfade |

```ts
player.on('beforeLoad', async (event) => {
  // Redirect to a different item:
  event.data.item = await fetchAlternativeItem(event.data.item.id);

  // Or cancel entirely:
  event.preventDefault();
});
```

`BeforeEvent` methods:
- `preventDefault()` — skip the default action
- `stopImmediatePropagation()` — skip remaining listeners
- `delay(promise)` — async-gate the action

---

## Auth events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `auth:refreshed` | `{ token: string }` | Token refresh succeeded |
| `auth:failed` | `{ error: unknown }` | Token refresh failed |

---

## Plugin events

Plugin events are namespaced under `plugin:<id>:<event>`. The base class auto-fires these for every plugin:

| Event | Payload |
|-------|---------|
| `plugin:<id>:installed` | `{ id: string; version: string }` |
| `plugin:<id>:enabled` | `{ id: string }` |
| `plugin:<id>:disabled` | `{ id: string; reason: string }` |
| `plugin:<id>:opts:changed` | `{ id: string; opts: object }` |
| `plugin:<id>:disposed` | `{ id: string }` |
| `plugin:<id>:failed` | `{ id: string; error: unknown }` |

Listen to a specific plugin's events using the class-form:

```ts
player.on(EqualizerPlugin, 'bandChanged', (event) => {
  // Typed from EqualizerPlugin's event map
});
```

---

## i18n events

| Event | Payload |
|-------|---------|
| `language` | `{ lang: string }` |
| `translations` | `{ lang: string; keys: string[] }` |

---

## Subscribing and unsubscribing

```ts
const handler = ({ time }: { time: number }) => updateUI(time);

player.on('time', handler);      // subscribe
player.off('time', handler);     // unsubscribe

player.once('ready', () => { }); // one-shot
```

From inside a plugin, always use `this.on(...)` rather than `player.on(...)` — it auto-disposes with the plugin.
