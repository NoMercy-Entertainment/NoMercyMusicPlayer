# Migration Guide — nomercy-music-player v1 → v2

This guide covers every breaking change between `@nomercy-entertainment/nomercy-music-player` v1 and v2. Read it before upgrading.

For kit-level changes (subpath imports, adapter ports, five-layer architecture), see the [kit migration guide](../../nomercy-player-kit/MIGRATION.md).

---

## TL;DR — is my import broken?

The npm package name is the same: `@nomercy-entertainment/nomercy-music-player`. The import `{ nmMPlayer, NMMusicPlayer }` resolves identically. If you are on npm `^1.x` you will not automatically receive v2 — you must opt in with `^2.0.0`.

**Your code will break.** Every `player.on(...)` call needs updating because event payload shapes changed across the board. Method names changed. Playlist item field names changed. The plugin API is a full replacement. Features that were always-on (Equalizer, Spectrum, MediaSession) are now opt-in plugins.

Read the checklist below, then work through each section.

---

## Quick migration checklist

- Replace `player.seek(time)` with `player.currentTime(t, opts?)`
- Replace `player.getDuration()` with `player.duration()`
- Replace `player.getCurrentTime()` with `player.currentTime()`
- Replace `player.getBuffer()` with `player.buffered()`
- Replace `player.getTimeData()` with `player.timeData()` — payload shape also changed
- Replace `player.setVolume(v)` with `player.volume(v)`
- Replace `player.getVolume()` with `player.volume()`
- Replace `player.getQueue()` with `player.queue()`
- Replace `player.setQueue(items)` with `player.queue(items, opts?)`
- Replace `player.addToQueue(item)` with `player.queueAppend(item, opts?)`
- Replace `player.pushToQueue(items)` with `player.queueAppend(items, opts?)`
- Replace `player.removeFromQueue(item)` with `player.queueRemove(id, opts?)`
- Replace `player.addToQueueNext(item)` with `player.queuePrepend(item, opts?)`
- Replace `player.getBackLog()` with `player.backlog()`
- Replace `player.setBackLog(items)` with `player.backlog(items)`
- Replace `player.addToBackLog(item)` with `player.backlogAppend(item)`
- Replace `player.removeFromBackLog(item)` with `player.backlogRemove(id)`
- Replace `player.playTrack(track, tracks?)` with `player.current(track, opts?)` + `player.queue(tracks)`
- Replace `player.setCurrentSong(item)` with `player.current(item, opts?)`
- Replace `player.currentSong` (property) with `player.current()` (method)
- Replace `player.shuffle(value)` with `player.shuffleState(value)` — boolean → `ShuffleState` enum
- Replace `player.repeat(value)` with `player.repeatState(value)`
- Replace `player.prepareCrossfade(item?)` with `player.crossfadeTo(track, opts?)` — see note below
- Replace `player.setAccessToken(token)` with `player.auth({ bearerToken: token })`
- Replace `player.setBaseUrl(url)` with `player.baseUrl(url)`
- Replace `player.isShuffling` with `player.shuffleState()`
- Replace `player.isRepeating` with `player.repeatState()`
- Replace `player.isMuted` with `player.volumeState()`
- Replace `player.isPlaying` with `player.playState()`
- Replace `player._crossfadeActive` with `player.isTransitioning()`
- Replace `player.context` with `player.audioContext()`
- Replace `item.path` with `item.url` on every track object (see [silent-break risk](#itempath--itemurl))
- Move EQ calls from `player.loadEqualizerSettings()` / `player.setPreGain(gain)` / `player.setFilter(band)` to `player.getPlugin(EqualizerPlugin)`
- Move MediaSession from constructor options to `player.addPlugin(MediaSessionPlugin)`
- Move Spectrum from constructor options to `player.addPlugin(SpectrumPlugin)`
- Move `onCrossfadeStart` / `onCrossfadeComplete` constructor callbacks to `player.on('crossfadeStart', fn)` / `player.on('crossfadeComplete', fn)`
- Update every `player.on(...)` event handler — payload shapes changed for all events
- Remove `siteTitle` from constructor options — player must not touch `document.title`

---

## Events renamed

| v1 event | v2 event |
|----------|----------|
| `song` | `current` |
| `fatalError` | `fatal` |
| `loadstart` | `setupStart` / `beforeLoad` |

---

## Events removed

These events no longer exist in v2. No compatibility shim is provided.

| v1 event | Why removed | v2 replacement |
|----------|-------------|----------------|
| `queueNext` | Internal implementation signal; leaked publicly | No replacement — internal to `AutoAdvancePlugin` |
| `startFadeOut` | Internal crossfade signal | `crossfadeStart` |
| `endFadeOut` | Internal crossfade signal | `crossfadeComplete` |
| `nextSong` | Internal implementation signal | `current` event |
| `setCurrentAudio` | Exposed internal `HTMLAudioElement` | No replacement — element is backend-internal |
| `setPreGain` | EQ moved to plugin | `plugin:equalizer:bandChanged` via `EqualizerPlugin` |
| `setPanner` | EQ moved to plugin | Plugin event via `MixerPlugin` |
| `setFilter` | EQ moved to plugin | Plugin event via `EqualizerPlugin` |
| `time-internal` | Internal timing detail | Never public — do not rely on it |
| `play-internal` | Internal playback detail | Never public |
| `pause-internal` | Internal playback detail | Never public |
| `loadedmetadata` | Internal media event | Not exposed in v2 |

---

## Events — payload shapes changed

Every event that carried a raw `HTMLAudioElement` or a multi-field object now carries a typed wrapper. Update every `player.on(...)` call.

| v1 event | v1 payload | v2 payload |
|----------|-----------|-----------|
| `play` | `HTMLAudioElement` | `ActionOptions` |
| `pause` | `HTMLAudioElement` | `ActionOptions` |
| `ended` | `HTMLAudioElement` | `void` |
| `error` | `HTMLAudioElement` | `PlayerErrorEvent` |
| `time` | `TimeState` (5 fields) | `{ time: number }` |
| `current` (was `song`) | `S \| null` | `{ item: T \| undefined; index: number }` |
| `shuffle` | `boolean` | `{ state: ShuffleState }` |
| `repeat` | `RepeatState` string | `{ state: RepeatState }` |
| `mute` | `boolean` | `{ muted: boolean }` |
| `volume` | `number` | `{ level: number }` |
| `seeked` | `TimeState` | `{ time: number }` |
| `crossfadeStart` | `void` | `{ from: T; to: T; duration: number }` |
| `crossfadeComplete` | `void` | `{ track: T }` |
| `duration` | `number` | `{ duration: number }` |
| `fatal` (was `fatalError`) | `{ error, recoverable, message }` | `PlayerErrorEvent` |
| `canplay` | `HTMLAudioElement` | `void` |
| `waiting` | `HTMLAudioElement` | `void` |

---

## Methods renamed

| v1 method | v2 method |
|-----------|-----------|
| `seek(time)` | `currentTime(t, opts?)` |
| `getDuration()` | `duration()` |
| `getCurrentTime()` | `currentTime()` |
| `getBuffer()` | `buffered()` |
| `getTimeData()` | `timeData()` |
| `setVolume(v)` | `volume(v)` |
| `getVolume()` | `volume()` |
| `getQueue()` | `queue()` |
| `setQueue(items)` | `queue(items, opts?)` |
| `addToQueue(item)` | `queueAppend(item, opts?)` |
| `pushToQueue(items)` | `queueAppend(items, opts?)` |
| `removeFromQueue(item)` | `queueRemove(id, opts?)` — takes id, not full item |
| `addToQueueNext(item)` | `queuePrepend(item, opts?)` |
| `getBackLog()` | `backlog()` |
| `setBackLog(items)` | `backlog(items)` |
| `addToBackLog(item)` | `backlogAppend(item)` |
| `pushToBackLog(items)` | `backlogAppend(items)` |
| `removeFromBackLog(item)` | `backlogRemove(id)` — takes id, not full item |
| `playTrack(track, tracks?)` | `current(track, opts?)` + `queue(tracks)` |
| `setCurrentSong(item)` | `current(item, opts?)` |
| `currentSong` (property) | `current()` (method) |
| `shuffle(value)` | `shuffleState(value)` — boolean → `ShuffleState` enum |
| `repeat(value)` | `repeatState(value)` |
| `prepareCrossfade(item?)` | `crossfadeTo(track, opts?)` — semantics changed |
| `setAccessToken(token)` | `auth({ bearerToken: token })` |
| `setBaseUrl(url)` | `baseUrl(url)` |
| `isShuffling` (property) | `shuffleState()` (method) |
| `isRepeating` (property) | `repeatState()` (method) |
| `isMuted` (property) | `volumeState()` (method, returns enum) |
| `isPlaying` (property) | `playState()` (method, returns `PlayState` enum) |
| `state` (PlayerState enum property) | `playState()` (method) |
| `_crossfadeActive` (property) | `isTransitioning()` (method) |
| `context` (AudioContext property) | `audioContext()` (method) |
| `isPlatform(platform)` | `isMobile()` / `isTv()` (separate methods) |
| `loadEqualizerSettings()` | `player.getPlugin(EqualizerPlugin)` |
| `saveEqualizerSettings()` | `EqualizerPlugin` state persistence |
| `setPreGain(gain)` | `player.getPlugin(EqualizerPlugin).setPreGain(gain)` |
| `setPanner(pan)` | `player.getPlugin(MixerPlugin)` |
| `setFilter(band)` | `player.getPlugin(EqualizerPlugin).setBand(...)` |
| `setAutoPlayback(v)` | `setup({ disableAutoPlayback: !v })` — config-time only |

---

## `item.path` → `item.url`

> **This is the highest-risk silent break in the migration. It is particularly sensitive for group listening and queue serialization.**

v1 `MusicPlaylistItem` used `path: string` as the audio source URL. v2 uses `url?: string`.

If your server API returns track objects with a `path` field and you pass them to the player without mapping, **the player will silently receive `undefined` for the source URL and fail to load the track**.

```ts
// v1 — server returns { path: '...', name: '...' }
player.setQueue(serverTracks);  // worked because player read item.path

// v2 — BREAKS. item.url is undefined, player cannot load the source.
player.queue(serverTracks);

// v2 — correct. Map the field before passing to the player:
player.queue(serverTracks.map(track => ({ ...track, url: track.path })));
```

**For group listening:** The queue is serialized and shared between participants in a listening session. If any participant's queue contains items without `url` set, they will fail to load tracks. The server must emit `url` (or you must map `path` → `url` before sharing the queue over the realtime channel).

**For queue serialization** (save/restore): If you persist queue state to storage using v1's `path`-based items, those serialized queues will not load correctly in v2. Migrate stored queues on first v2 boot.

Full `MusicPlaylistItem` shape changes:

| v1 field | v2 field | Change |
|----------|----------|--------|
| `path: string` (required) | `url?: string` | Renamed + now optional |
| `name: string` (required) | `name: string` (required) | Same |
| `album_track: { name, ...any }[]` (required) | `album_track?: AlbumRef[]` | Required → optional |
| `artist_track: { name, ...any }[]` (required) | `artist_track?: ArtistRef[]` | Required → optional |
| `cover` (typed as `any`) | `cover?: string` | Now typed |
| (not present) | `lyricsUrl?: string` | New — source URL for `LyricsPlugin` |
| (not present) | `duration?: number` | New |
| `id` (via index signature) | `id` (from `BasePlaylistItem`) | Now typed and required |

---

## `MusicPlaylistItem` generic parameter

`NMMusicPlayer<T extends MusicPlaylistItem>` is generic in v2. Your track type is threaded through the player's type system.

```ts
interface MyTrack extends MusicPlaylistItem {
  userRating?: number;
  isExplicit: boolean;
}

const player = nmMPlayer<MyTrack>('player-1').setup({ ... });

// player.current() returns MyTrack | undefined — no cast needed
const track = player.current();
track?.userRating;
```

---

## `shuffleState` — boolean to enum

v1's `player.shuffle(value)` accepted a `boolean`. v2's `player.shuffleState(value)` accepts a `ShuffleState` enum.

```ts
// v1
player.shuffle(true);

// v2
import { ShuffleState } from '@nomercy-entertainment/nomercy-music-player';
player.shuffleState(ShuffleState.On);  // or ShuffleState.Off
```

The `shuffle` event payload also changed from `boolean` to `{ state: ShuffleState }`.

---

## Crossfade API change

v1's `prepareCrossfade(item?)` was a "pre-stage the secondary track for later" operation — designed to be called by server-side crossfade timing signals (e.g. via SignalR), staging the next track's audio element before the fade timer fires. v2's `crossfadeTo(track, opts?)` means "start the crossfade now."

This is a semantic break, not just a rename. Server-orchestrated crossfade code must be restructured:

```ts
// v1 — called by SignalR when server decides to start staging
player.prepareCrossfade(nextTrack);

// v2 — there is no "stage then trigger later" one-liner.
// The crossfade itself becomes the server signal response:
signalR.on('crossfadeNow', (nextTrack) => {
  player.crossfadeTo(nextTrack, { curve: 'equal-power', durationMs: 3000 });
});
```

If you need to pre-load the secondary track's audio without starting the crossfade, this is an open feature gap (tracked as audit item Q-4). For now, coordinate with server to send the "start crossfade" signal earlier to account for network + decode time.

---

## `ready` event timing

v1 fired `ready` after a hardcoded 1500ms `setTimeout` in the constructor. v2 fires `ready` after the full setup pipeline resolves — including all plugins' async `use()` promises.

If you have any code that races against the 1500ms delay or depends on `ready` firing after an approximate time, it will behave differently in v2.

Use `await player.ready()` to wait for setup:

```ts
await player.ready();
// all plugins resolved; safe to interact with the player
```

---

## Plugin system replacement

v1 had a string-keyed registry but most v1 music player users never called it explicitly — features like EQ, Spectrum, and MediaSession were wired into the player class itself.

In v2, every non-core feature is a plugin you must explicitly register. Nothing is always-on.

```ts
// v1 — features built in, configured via constructor
const player = new NMMusicPlayer({
  motionConfig: { ... },    // spectrum analyzer
  actions: { ... },          // MediaSession
  onCrossfadeStart: fn,
  onCrossfadeComplete: fn,
});

// v2 — everything is an opt-in plugin
import {
  nmMPlayer,
  AutoAdvancePlugin,
  EqualizerPlugin,
  SpectrumPlugin,
  MediaSessionPlugin,
  AudioGraphPlugin,
} from '@nomercy-entertainment/nomercy-music-player';

const player = nmMPlayer('player-1').setup({
  crossfadeDefaults: { durationMs: 3000, curve: 'equal-power' },
});

player
  .addPlugin(AudioGraphPlugin)            // required by EQ + Spectrum
  .addPlugin(EqualizerPlugin, { presets: myPresets })
  .addPlugin(SpectrumPlugin, { /* audiomotion config here */ })
  .addPlugin(MediaSessionPlugin, { artwork: [...] })
  .addPlugin(AutoAdvancePlugin);

player.on('crossfadeStart', fn);
player.on('crossfadeComplete', fn);
```

**Plugins that moved from always-on to opt-in:**

| v1 (always on) | v2 (opt-in) |
|----------------|-------------|
| Equalizer (WebAudio BiquadFilter) | `addPlugin(EqualizerPlugin)` (requires `AudioGraphPlugin`) |
| Spectrum (audiomotion-analyzer) | `addPlugin(SpectrumPlugin)` (requires `AudioGraphPlugin`) |
| MediaSession | `addPlugin(MediaSessionPlugin)` |
| Auto-advance (play on ended) | `addPlugin(AutoAdvancePlugin)` |
| `motionConfig` / `motionColors` constructor options | `SpectrumPlugin` options at `addPlugin` |
| `actions` constructor option | `MediaSessionPlugin` options at `addPlugin` |

**Cross-plugin event listening** is typed:

```ts
player.on(EqualizerPlugin, 'bandChanged', (event) => {
  // event.data is typed from EqualizerPlugin's event map
});
```

---

## Adapter injection

v2 introduces 34 named adapter ports (28 from the kit + 6 music-specific). All ports have sensible defaults. You only need to inject when you want to replace default behavior.

```ts
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { LocalStorageBackend } from '@nomercy-entertainment/nomercy-player-core';

const player = nmMPlayer('player-1').setup({
  // Kit adapters:
  storage: new LocalStorageBackend(),
  accessToken: () => myAuth.getToken(),

  // Music-specific adapters:
  backend: 'webaudio',             // 'webaudio' (default) or 'audio-element'
  scrobbler: myLastFmScrobbler,    // reports to Last.fm
  lyricSource: new LrcFileLyricSource(),
});
```

**Music-specific ports:**

| Port | Interface | Default |
|------|-----------|---------|
| audio-backend | `IAudioBackend` | `WebAudioBackend` |
| playlist-generator | `IPlaylistGenerator` | `linear` |
| similarity-engine | `ISimilarityEngine` | consumer-required (no default) |
| scrobbler | `IScrobbler` | `noop` |
| lyric-source | `ILyricSource` | `lrc-file` |
| now-playing-art | `INowPlayingArt` | `media-session` |

See the [kit migration guide](../../nomercy-player-kit/MIGRATION.md) for the full 28-port kit catalog and subpath import table.

---

## Constructor options that moved

| v1 constructor option | v2 equivalent |
|----------------------|---------------|
| `siteTitle: string` | **Removed** — player must not touch `document.title` |
| `expose: boolean` (required) | `setup({ expose?: boolean })` — optional in v2 |
| `debug: boolean` | `setup({ logLevel: 'debug' })` |
| `motionConfig` | `addPlugin(SpectrumPlugin, { /* audiomotion opts */ })` |
| `motionColors` | `addPlugin(SpectrumPlugin, { colors: [...] })` |
| `actions` (MediaSession) | `addPlugin(MediaSessionPlugin, { actions: { ... } })` |
| `onCrossfadeStart` | `player.on('crossfadeStart', fn)` |
| `onCrossfadeComplete` | `player.on('crossfadeComplete', fn)` |
| `fadeDuration` | `setup({ crossfadeDefaults: { durationMs: ... } })` |
| `prefetchLeeway` | `setup({ preloadLeadSeconds: ... })` |
| `disableAutoPlayback` | `setup({ disableAutoPlayback: true })` |
| `baseUrl` | `setup({ baseUrl: ... })` |

---

## Volume storage key migration

v1 stored volume under the key `nmplayer-music-volume` in `localStorage`. v2 uses the pluggable `IStorage` backend with keys namespaced under the player id. On first v2 boot, saved volume will not be restored from v1 storage.

If restoring saved volume matters for your users, read the v1 key before initializing the v2 player and pass it in:

```ts
const savedVolume = parseFloat(localStorage.getItem('nmplayer-music-volume') ?? '1');
const player = nmMPlayer('player-1').setup({
  volume: savedVolume,
  // ...
});
```

This is a one-time migration — v2 will persist using its own key going forward.

---

## Subpath imports

v2 exports each adapter and plugin from a dedicated subpath. The root barrel import still works; subpaths are opt-in for tree-shaking.

```ts
// Still works (barrel):
import { AutoAdvancePlugin, LyricsPlugin } from '@nomercy-entertainment/nomercy-music-player';

// Tree-shakeable subpaths:
import { AutoAdvancePlugin } from '@nomercy-entertainment/nomercy-music-player/plugins/auto-advance';
import { LyricsPlugin } from '@nomercy-entertainment/nomercy-music-player/plugins/lyrics';
import { GroupListeningPlugin } from '@nomercy-entertainment/nomercy-music-player/plugins/group-listening';
import { WebAudioBackend } from '@nomercy-entertainment/nomercy-music-player/adapters/audio-backend';
```

---

## Upgrading downstream NoMercy projects

### nomercy-app-web

High-impact areas:
- Every `player.on(...)` music event handler needs payload updates (`song` → `current`, `{ item, index }` payload shape, etc.)
- Equalizer, Spectrum, and MediaSession wiring — move from constructor options to `addPlugin` calls
- `player.setPreGain()` / `player.setFilter()` calls → `player.getPlugin(EqualizerPlugin).*`
- `prepareCrossfade(item)` SignalR handler → `crossfadeTo(track, opts)`
- `item.path` → `item.url` in the adapter layer that maps server responses to track objects
- `player.currentSong` property access → `player.current()` method call
- `player.isShuffling` / `player.isRepeating` property access → method calls with enum types
- `player.isMuted` / `player.isPlaying` → `player.volumeState()` / `player.playState()`
- Group listening queue serialization — verify `url` field is present in serialized items

### nomercy-cast-player

The cast receiver is slated for a full rewrite. Music player migration should happen as part of that rewrite rather than as an incremental patch.

---

## Getting help

- Issue tracker: [github.com/NoMercy-Entertainment/nomercy-music-player/issues](https://github.com/NoMercy-Entertainment/nomercy-music-player/issues)
- Discord: NoMercy Entertainment server — `#player-dev` channel
- Testbed (live integration reference): `tools/player-testbed/` in the monorepo
- Kit migration guide: `packages/nomercy-player-kit/MIGRATION.md`
