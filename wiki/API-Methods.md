# API Methods Reference

All public methods on `NMMusicPlayer<T>`. Methods follow the overloaded getter/setter pattern: `method()` reads, `method(value)` writes.

---

## Factory

### `nmMPlayer(id)`

```ts
nmMPlayer(id: string): NMMusicPlayer<MusicPlaylistItem>
nmMPlayer<T extends MusicPlaylistItem>(id: string): NMMusicPlayer<T>
```

Creates or retrieves a named player instance. Two calls with the same `id` return the same instance. Instances persist until `dispose()` is called.

---

## Setup

### `setup(opts)`

```ts
setup(opts: MusicPlayerConfig<T>): NMMusicPlayer<T>
```

Initialize the player with config. Returns the player for chaining. See [Configuration](Configuration.md) for all options.

### `ready()`

```ts
ready(): Promise<void>
```

Resolves when setup is complete and all plugins' `use()` promises have resolved. Safe to await before calling transport methods.

### `dispose()`

```ts
dispose(): void
```

Tears down the player: stops playback, disposes all plugins, removes event listeners, frees the audio backend. The instance is removed from the internal registry.

---

## Transport

### `play(opts?)`

```ts
play(opts?: ActionOptions): Promise<void>
```

Start or resume playback.

### `pause(opts?)`

```ts
pause(opts?: ActionOptions): Promise<void>
```

Pause playback.

### `stop(opts?)`

```ts
stop(opts?: ActionOptions): Promise<void>
```

Stop playback and reset position to 0.

### `togglePlayback(opts?)`

```ts
togglePlayback(opts?: ActionOptions): Promise<void>
```

Toggle between play and pause.

### `restart(opts?)`

```ts
restart(opts?: ActionOptions): Promise<void>
```

Seek to 0 and play.

---

## Queue navigation

### `next(opts?)`

```ts
next(opts?: ActionOptions): Promise<void>
```

Advance to the next track.

### `previous(opts?)`

```ts
previous(opts?: ActionOptions): Promise<void>
```

Return to the previous track.

### `seekToIndex(index, opts?)`

```ts
seekToIndex(index: number, opts?: ActionOptions): Promise<void>
```

Jump to a specific position in the queue by index.

### `peekNext()`

```ts
peekNext(): T | undefined
```

Return the next track without changing the current track.

### `peekPrevious()`

```ts
peekPrevious(): T | undefined
```

Return the previous track without changing the current track.

---

## Current track

### `current()`

```ts
current(): T | undefined
```

Return the currently loaded track.

### `current(item, opts?)`

```ts
current(item: T, opts?: ActionOptions): void
```

Set the current track. The track must be in the queue.

### `currentIndex()`

```ts
currentIndex(): number
```

Index of the current track in the queue. Returns `-1` if no track is loaded.

### `load(item, opts?)`

```ts
load(item: T, opts?: LoadOptions): Promise<void>
```

Load a single track into the player without requiring it to be in the queue first. Does not start playback.

---

## Time

### `currentTime()`

```ts
currentTime(): number
```

Return the current playback position in seconds.

### `currentTime(t, opts?)`

```ts
currentTime(t: number, opts?: SeekOptions): void
```

Seek to a position in seconds.

### `duration()`

```ts
duration(): number
```

Total duration of the current track in seconds.

### `buffered()`

```ts
buffered(): number
```

Seconds of audio buffered ahead of the current position.

### `bufferedRanges()`

```ts
bufferedRanges(): TimeRanges
```

All buffered time ranges.

### `seekable()`

```ts
seekable(): TimeRanges
```

Seekable time ranges.

### `forward(s?, opts?)`

```ts
forward(s?: number, opts?: SeekOptions): void
```

Skip forward by `s` seconds (default: 10).

### `rewind(s?, opts?)`

```ts
rewind(s?: number, opts?: SeekOptions): void
```

Skip backward by `s` seconds (default: 10).

### `seekByPercentage(pct, opts?)`

```ts
seekByPercentage(pct: number, opts?: SeekOptions): void
```

Seek to a percentage of the total duration (0–1).

### `timeData()`

```ts
timeData(): TimeData
```

Full time snapshot: `{ time, duration, buffered, seekable, playbackRate }`.

---

## Volume

### `volume()`

```ts
volume(): number
```

Return the current volume (0–1).

### `volume(v)`

```ts
volume(v: number): void
```

Set the volume (0–1).

### `mute()`

```ts
mute(): void
```

Mute the player.

### `unmute()`

```ts
unmute(): void
```

Unmute the player.

### `toggleMute()`

```ts
toggleMute(): void
```

Toggle mute state.

### `volumeUp(step?)`

```ts
volumeUp(step?: number): void
```

Increase volume by `step` (default: 0.1).

### `volumeDown(step?)`

```ts
volumeDown(step?: number): void
```

Decrease volume by `step` (default: 0.1).

### `volumeState()`

```ts
volumeState(): VolumeState
```

Return `VolumeState` enum (`Muted`, `Low`, `Normal`, `High`).

---

## Playback rate

### `playbackRate()`

```ts
playbackRate(): number
```

Current playback rate (default: 1.0).

### `playbackRate(r)`

```ts
playbackRate(r: number): void
```

Set playback rate.

### `playbackRates()`

```ts
playbackRates(): number[]
```

Available playback rate options.

---

## Shuffle and repeat

### `shuffleState()`

```ts
shuffleState(): ShuffleState
```

Current shuffle state (`ShuffleState.Off` | `ShuffleState.On`).

### `shuffleState(state)`

```ts
shuffleState(state: ShuffleState): void
```

Set shuffle state.

### `repeatState()`

```ts
repeatState(): RepeatState
```

Current repeat state (`RepeatState.Off` | `RepeatState.One` | `RepeatState.All`).

### `repeatState(state)`

```ts
repeatState(state: RepeatState): void
```

Set repeat state.

---

## Queue management

### `queue()`

```ts
queue(): ReadonlyArray<T>
```

Return the current queue.

### `queue(items, opts?)`

```ts
queue(items: T[], opts?: QueueOptions): void
```

Replace the queue.

### `queueAppend(items, opts?)`

```ts
queueAppend(items: T | T[], opts?: QueueOptions): void
```

Append one or more tracks to the end of the queue.

### `queuePrepend(items, opts?)`

```ts
queuePrepend(items: T | T[], opts?: QueueOptions): void
```

Insert one or more tracks immediately after the current track.

### `queueRemove(id, opts?)`

```ts
queueRemove(id: string | number, opts?: QueueOptions): void
```

Remove a track from the queue by id.

### `queueRemoveAt(index, opts?)`

```ts
queueRemoveAt(index: number, opts?: QueueOptions): void
```

Remove the track at a specific index.

### `queueInsert(item, index, opts?)`

```ts
queueInsert(item: T, index: number, opts?: QueueOptions): void
```

Insert a track at a specific index.

### `queueMove(from, to, opts?)`

```ts
queueMove(from: number, to: number, opts?: QueueOptions): void
```

Move a track from one index to another.

### `queueClear(opts?)`

```ts
queueClear(opts?: QueueOptions): void
```

Remove all tracks from the queue.

### `queueShuffle(opts?)`

```ts
queueShuffle(opts?: QueueOptions): void
```

Shuffle the current queue in place.

### `queueSort(fn, opts?)`

```ts
queueSort(fn: (a: T, b: T) => number, opts?: QueueOptions): void
```

Sort the queue by a comparator function.

### `queueIndexOf(id)`

```ts
queueIndexOf(id: string | number): number
```

Return the index of a track by id, or `-1` if not found.

### `queueLength()`

```ts
queueLength(): number
```

Number of tracks in the queue.

---

## Backlog

The backlog is a secondary list for tracks that have been played. Used as a history buffer for `previous()`.

### `backlog()`

```ts
backlog(): ReadonlyArray<T>
```

### `backlog(items)`

```ts
backlog(items: T[]): void
```

### `backlogAppend(items)`

```ts
backlogAppend(items: T | T[]): void
```

### `backlogRemove(id)`

```ts
backlogRemove(id: string | number): void
```

### `backlogClear()`

```ts
backlogClear(): void
```

---

## Crossfade

### `crossfadeTo(track, opts?)`

```ts
crossfadeTo(track: T, opts?: CrossfadeOpts): Promise<void>
```

Start a crossfade to the given track immediately. Uses `crossfadeDefaults` from setup if no `opts` are provided.

### `isTransitioning()`

```ts
isTransitioning(): boolean
```

Returns `true` if a crossfade is in progress.

---

## Audio output

### `audioOutputs()`

```ts
audioOutputs(): Promise<MediaDeviceInfo[]>
```

Enumerate available audio output devices.

### `selectAudioOutput(deviceId)`

```ts
selectAudioOutput(deviceId: string): Promise<void>
```

Route audio to a specific output device.

### `currentAudioOutput()`

```ts
currentAudioOutput(): string | undefined
```

Id of the currently selected audio output device.

---

## Audio tracks (HLS)

### `audioTracks()`

```ts
audioTracks(): AudioTrack[]
```

Available audio tracks (for multi-language HLS sources).

### `currentAudioTrack()`

```ts
currentAudioTrack(): number
```

Index of the current audio track.

### `currentAudioTrack(index)`

```ts
currentAudioTrack(index: number): void
```

Switch to an audio track by index.

### `cycleAudioTracks()`

```ts
cycleAudioTracks(): void
```

Cycle to the next available audio track.

---

## Subtitles and chapters

The music player gains these from the kit for completeness (streaming audio with embedded cues).

### `subtitles()`

```ts
subtitles(): SubtitleTrack[]
```

### `currentSubtitle()`

```ts
currentSubtitle(): number | null
```

### `currentSubtitle(index)`

```ts
currentSubtitle(index: number | null): void
```

### `chapters()`

```ts
chapters(): Chapter[]
```

---

## Backend

### `backend()`

```ts
backend(): 'webaudio' | 'audio-element'
```

### `backend(kind)`

```ts
backend(kind: 'webaudio' | 'audio-element'): Promise<void>
```

Switch backends at runtime.

### `audioContext()`

```ts
audioContext(): AudioContext | undefined
```

The underlying `AudioContext`. Only available when using `WebAudioBackend`.

---

## Auth

### `auth()`

```ts
auth(): AuthConfig | undefined
```

### `auth(config)`

```ts
auth(config: Partial<AuthConfig>): void
```

Update auth config at runtime (e.g. to refresh a static bearer token).

---

## URL

### `baseUrl()`

```ts
baseUrl(): string | undefined
```

### `baseUrl(url)`

```ts
baseUrl(url: string): void
```

### `resolveUrl(url, category?)`

```ts
resolveUrl(url: string, category?: string): string
```

Resolve a relative URL against the player's base URL.

---

## Plugins

### `addPlugin(PluginClass, opts?)`

```ts
addPlugin<P extends Plugin>(Cls: PluginClass<P>, opts?: PluginOptions<P>): NMMusicPlayer<T>
```

Register and activate a plugin. Returns the player for chaining.

### `getPlugin(PluginClass)`

```ts
getPlugin<P extends Plugin>(Cls: PluginClass<P>): P | undefined
```

Retrieve a registered plugin instance, typed.

### `getPluginById(id)`

```ts
getPluginById(id: string): Plugin | undefined
```

Retrieve a plugin by its string id.

### `removePlugin(PluginClass, opts?)`

```ts
removePlugin<P extends Plugin>(Cls: PluginClass<P>, opts?: { cascade?: boolean }): void
```

Dispose and remove a plugin. Throws if other plugins depend on it (unless `cascade: true`).

### `plugins()`

```ts
plugins(): Plugin[]
```

All currently registered plugins.

---

## Phase and diagnostics

### `phase()`

```ts
phase(): PlayerPhase
```

Current player phase: `'idle' | 'setup' | 'ready' | 'loading' | 'starting' | 'playing' | 'paused' | 'buffering' | 'seeking' | 'ended' | 'stopped' | 'disposing' | 'disposed'`.

### `playState()`

```ts
playState(): PlayState
```

Current play state enum: `PlayState.Idle | PlayState.Playing | PlayState.Paused | PlayState.Ended | PlayState.Stopped`.

### `metrics()`

```ts
metrics(): PlayerMetrics
```

Playback metrics snapshot.

### `recordMetric(name, value)`

```ts
recordMetric(name: string, value: number): void
```

Record a custom metric.

### `bandwidth()`

```ts
bandwidth(): number
```

Current estimated bandwidth in bits/sec.

### `now()`

```ts
now(): number
```

Monotonic clock value from the configured `IClock`. Use for distributed time sync in group-listening scenarios.

---

## i18n

### `t(key, vars?)`

```ts
t(key: string, vars?: Record<string, string | number>): string
```

Translate a key using the configured `ITranslator`.

### `language()`

```ts
language(): string
```

### `setLanguage(lang)`

```ts
setLanguage(lang: string): Promise<void>
```

---

## Capabilities

### `canPlay(profile)`

```ts
canPlay(profile: MediaCapabilityProfile): Promise<boolean>
```

Check `MediaCapabilities` for a given format profile.

### `isMobile()`

```ts
isMobile(): boolean
```

### `isTv()`

```ts
isTv(): boolean
```

### `device()`

```ts
device(): DeviceCapabilities
```

Device capability snapshot.

---

## Cast

### `castState()`

```ts
castState(): CastState
```

### `transferTo(target)`

```ts
transferTo(target: CastTarget): Promise<void>
```

Hand off playback to a Chromecast or AirPlay device.

---

## Announce (accessibility)

### `announce(text, level?)`

```ts
announce(text: string, level?: 'polite' | 'assertive'): void
```

ARIA live-region announcement for screen readers.

---

## Event API

### `on(event, handler)`

```ts
on<K extends keyof MusicEventMap>(event: K, handler: (payload: MusicEventMap[K]) => void): void
```

### `off(event, handler)`

```ts
off<K extends keyof MusicEventMap>(event: K, handler: (payload: MusicEventMap[K]) => void): void
```

### `once(event, handler)`

```ts
once<K extends keyof MusicEventMap>(event: K, handler: (payload: MusicEventMap[K]) => void): void
```

### `on(PluginClass, event, handler)` (cross-plugin)

```ts
on<P extends Plugin, K extends keyof P['__events__']>(
  Cls: PluginClass<P>,
  event: K,
  handler: (payload: P['__events__'][K]) => void,
): void
```
