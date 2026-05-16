# Configuration Reference

All options passed to `nmMPlayer(id).setup(opts)`.

---

## Basics

### `queue`

```ts
queue?: T[] | string
```

Initial track list. Pass an array of `MusicPlaylistItem`-compatible objects, or a URL to fetch a playlist. Defaults to an empty queue.

```ts
player.setup({ queue: [{ id: '1', name: 'Track', url: '...' }] });
```

### `autoPlay`

```ts
autoPlay?: boolean
```

Start playback immediately after setup resolves. Default `false`.

### `disableAutoPlayback`

```ts
disableAutoPlayback?: boolean
```

When `true`, the player will never start playback without an explicit `play()` call. Overrides `autoPlay`. Default `false`.

### `expose`

```ts
expose?: boolean
```

Expose the player instance on `window.__nmplayer_<id>` for debugging. Default `false`.

### `baseUrl`

```ts
baseUrl?: string
```

Base URL prepended to relative audio source URLs. Default: none (URLs used as-is).

---

## Audio backend

### `backend`

```ts
backend?: 'webaudio' | 'audio-element'
```

Which audio backend to use initially. Default: `'webaudio'`.

- `'webaudio'` — `WebAudioBackend`. Routes audio through a `Web Audio API` graph. Required for crossfade, EQ, and spectrum analysis.
- `'audio-element'` — `AudioElementBackend`. Simpler; two `<audio>` elements with no Web Audio graph. Use when Web Audio is unavailable or unnecessary.

You can switch backends at runtime: `player.backend('audio-element')`.

### `backendFactory`

```ts
backendFactory?: (kind: 'webaudio' | 'audio-element', config: AudioBackendConfig) => IAudioBackend
```

Inject a custom audio backend. The factory receives the resolved `kind` and full config. Returns an `IAudioBackend` instance.

---

## Auth

### `auth`

```ts
auth?: {
  bearerToken?: string | (() => string | Promise<string>);
  refreshOnUnauthenticated?: () => Promise<string>;
  signRequest?: (request: Request) => Request | Promise<Request>;
  headers?: Record<string, string>;
}
```

Auth pipeline for HLS segment and manifest requests.

- `bearerToken` — token or factory. Injected as `Authorization: Bearer <token>`.
- `refreshOnUnauthenticated` — called once on a 401 response. Must return a new token.
- `signRequest` — HMAC or custom signing. Called after bearer is applied.
- `headers` — static headers appended to every request.

On a 403, the error propagates. `refreshOnUnauthenticated` is never called for 403s.

---

## Crossfade

### `crossfadeDefaults`

```ts
crossfadeDefaults?: {
  durationMs?: number;
  curve?: 'linear' | 'equal-power';
  startAt?: number;
}
```

Default crossfade parameters used when no explicit options are passed to `crossfadeTo()`.

- `durationMs` — milliseconds. Default: `3000`.
- `curve` — gain curve. `'equal-power'` preserves perceived loudness. Default: `'equal-power'`.
- `startAt` — seconds before track end to start the fade automatically via `AutoAdvancePlugin`. Default: `durationMs / 1000`.

### `crossfadeEnabled`

```ts
crossfadeEnabled?: boolean
```

Whether crossfade is active by default. Default: `false`. `AutoAdvancePlugin` respects this when deciding how to transition tracks.

---

## Preload

### `preloadLeadSeconds`

```ts
preloadLeadSeconds?: number
```

How many seconds before the current track ends to begin loading the next. Default: `30`.

### `trackEndingSoonThreshold`

```ts
trackEndingSoonThreshold?: number
```

Seconds remaining when the `trackEndingSoon` event fires. Plugins and app code use this to trigger pre-staging. Default: `30`.

---

## Queue

### `disableAutoPlayback`

Already covered in Basics above.

### `pauseWhenHidden`

```ts
pauseWhenHidden?: boolean
```

Pause playback when the page is hidden (visibility API). Default: `false`.

---

## Logging

### `debug`

```ts
debug?: boolean
```

Deprecated alias for `logLevel: 'debug'`. Use `logLevel` instead.

### `logLevel`

```ts
logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'
```

Log verbosity. Default: `'warn'`.

### `logger`

```ts
logger?: ILogger
```

Custom logger. Defaults to the kit's console logger. Inject a Pino, Winston, or Bunyan adapter for production log routing.

---

## Storage

### `storage`

```ts
storage?: IStorage
```

Where plugin state is persisted (volume, EQ presets, shuffle state, etc.). Defaults to `LocalStorageBackend`.

```ts
import { LocalStorageBackend, MemoryStorageBackend, IndexedDBBackend } from '@nomercy-entertainment/nomercy-player-core';

// Default:
storage: new LocalStorageBackend()

// Testing (ephemeral, no cross-tab persistence):
storage: new MemoryStorageBackend()

// High-capacity (for large EQ preset libraries):
storage: new IndexedDBBackend('my-db')
```

---

## Platform

### `platform`

```ts
platform?: IPlatform
```

Platform abstraction bundle. Defaults to `browserPlatform` from the kit.

For native-shell environments, override individual sub-ports:

```ts
import { browserPlatform } from '@nomercy-entertainment/nomercy-player-core';

player.setup({
  platform: {
    ...browserPlatform,
    network: myCapacitorNetworkMonitor,
  },
});
```

Sub-ports: `wakeLock`, `network`, `visibility`, `capabilities`. (Fullscreen and PiP are video-only sub-ports.)

---

## Realtime

### `websocketFactory`

```ts
websocketFactory?: (url: string, opts: RealtimeChannelOpts) => IRealtimeChannel
```

Realtime channel factory. Used by `GroupListeningPlugin` and `CastSenderPlugin`. Defaults to a native WebSocket adapter.

For SignalR or Socket.IO, inject a matching adapter package.

---

## i18n

### `language`

```ts
language?: string
```

Initial language code (BCP 47, e.g. `'en'`, `'nl'`, `'ja'`). Default: browser `navigator.language`.

### `translations`

```ts
translations?: Translations
```

Inline translation strings. Keys match the kit's internal event and error messages.

### `loadTranslations`

```ts
loadTranslations?: (lang: string) => Promise<Translations>
```

Async translation loader. Called when `player.setLanguage(lang)` is called or on init if `language` is set.

---

## Metrics

### `metricsIntervalMs`

```ts
metricsIntervalMs?: number
```

Interval for the throttled `progress` event (milliseconds). Default: `5000`.

---

## Music-specific adapters

Pass adapter instances via `setup()` alongside the options above.

| Option key | Interface | Default |
|------------|-----------|---------|
| `playlistGenerator` | `IPlaylistGenerator` | `linear` |
| `similarityEngine` | `ISimilarityEngine` | none — consumer-required |
| `scrobbler` | `IScrobbler` | `noop` |
| `lyricSource` | `ILyricSource` | `lrc-file` |
| `nowPlayingArt` | `INowPlayingArt` | `media-session` |

See [nomercy-player-kit MIGRATION.md](../../nomercy-player-kit/MIGRATION.md) for the full 28-port kit adapter catalog.
