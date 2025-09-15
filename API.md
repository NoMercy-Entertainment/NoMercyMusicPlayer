# NoMercy Music Player - API Documentation

> Complete TypeScript API reference for the NoMercy Music Player

## Table of Contents

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Types](#types)
- [Events](#events)
- [Methods](#methods)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Core Classes

### `MusicPlayer<T extends BasePlaylistItem>`

The main player class that extends the queue and audio management functionality.

```typescript
class MusicPlayer<T extends BasePlaylistItem> extends Queue<T>
```

#### Constructor

```typescript
constructor(config: PlayerOptions)
```

**Parameters:**
- `config: PlayerOptions` - Player configuration object

**Example:**
```typescript
const player = new MusicPlayer({
  baseUrl: 'https://api.example.com/',
  siteTitle: 'My Music App',
  expose: true,
  motionConfig: { mode: 2, fftSize: 8192 },
  motionColors: ['#ff0000', '#00ff00', '#0000ff']
});
```

---

### `Queue<T extends BasePlaylistItem>`

Handles queue management, track ordering, and playback flow.

```typescript
class Queue<T extends BasePlaylistItem> extends Helpers<T>
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentSong` | `T \| null` | Currently playing track |
| `_queue` | `Array<T>` | Main playback queue |
| `_backLog` | `Array<T>` | Previously played tracks |
| `_shuffle` | `boolean` | Shuffle mode state |
| `_repeat` | `RepeatState` | Repeat mode: 'off', 'one', 'all' |

---

### `Helpers<T extends BasePlaylistItem>`

Base class providing event management, equalizer, and utility functions.

```typescript
class Helpers<T extends BasePlaylistItem> extends EventTarget
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `volume` | `number` | `100` | Current volume (0-100) |
| `isPlaying` | `boolean` | `false` | Playback state |
| `isMuted` | `boolean` | `false` | Mute state |
| `isShuffling` | `boolean` | `false` | Shuffle state |
| `isRepeating` | `boolean` | `false` | Repeat state |
| `currentTime` | `number` | `0` | Current playback position (seconds) |
| `duration` | `number` | `0` | Track duration (seconds) |
| `fadeDuration` | `number` | `3` | Crossfade duration (seconds) |

---

## Interfaces

### `PlayerOptions`

Main configuration interface for player initialization.

```typescript
interface PlayerOptions {
  baseUrl?: string;              // Media server base URL
  siteTitle: string;             // Window title suffix (required)
  expose?: boolean;              // Expose to window.musicPlayer
  disableAutoPlayback?: boolean; // Disable automatic queue advancement
  motionConfig?: ConstructorOptions; // Spectrum analyzer configuration
  motionColors?: string[];       // Visualization color palette
  actions?: MediaSessionActions; // Custom media session handlers
}
```

**Required Fields:**
- `siteTitle`: Used for window title management

**Example:**
```typescript
const config: PlayerOptions = {
  baseUrl: 'https://cdn.example.com/music/',
  siteTitle: 'Awesome Music Player',
  expose: true,
  disableAutoPlayback: false,
  motionConfig: {
    mode: 3,
    barSpace: 0.1,
    fftSize: 16384
  },
  motionColors: ['#e91e63', '#9c27b0', '#3f51b5'],
  actions: {
    play: () => customPlayHandler(),
    pause: () => customPauseHandler(),
  }
};
```

---

### `BasePlaylistItem`

Base interface for playlist tracks that can be extended.

```typescript
interface BasePlaylistItem {
  name: string;
  path: string;
  artist_track: {
    name: string;
    [key: string]: any;
  }[];
  album_track: {
    name: string;
    [key: string]: any;
  }[];
  [key: string]: any; // Extensible for custom properties
}
```

**Extension Example:**
```typescript
interface ExtendedPlaylistItem extends BasePlaylistItem {
  id: string;
  cover?: string;
  duration: number;
  genre?: string;
  year?: number;
  bitrate?: number;
  lyrics?: LyricLine[];
}
```

---

### `TimeState`

Provides comprehensive time information during playback.

```typescript
interface TimeState {
  position: number;    // Current position in seconds
  duration: number;    // Total duration in seconds  
  remaining: number;   // Remaining time in seconds
  percentage: number;  // Playback percentage (0-100)
  buffered: number;    // Buffer percentage (0-100)
}
```

---

### `EQBand`

Equalizer band configuration.

```typescript
interface EQBand {
  frequency: number | 'Pre'; // Frequency in Hz or 'Pre' for preamp
  gain: number;              // Gain in dB (-12 to +12)
}
```

---

### `EqualizerPreset`

Pre-configured equalizer settings.

```typescript
interface EqualizerPreset {
  name: string;
  values: { frequency: number; gain: number }[];
}
```

**Built-in Presets:**
- Classical, Club, Dance, Flat, Pop, Rock, Reggae, Soft, Ska
- Full Bass, Soft Rock, Full Treble, Full Bass & Treble
- Live, Techno, Party, Laptop speakers/headphones, Large hall

---

## Types

### `RepeatState`

```typescript
type RepeatState = 'off' | 'one' | 'all';
```

- `'off'`: No repeat
- `'one'`: Repeat current track
- `'all'`: Repeat entire queue

### Primitive Types

```typescript
type Time = number;        // Time in seconds
type Volume = number;      // Volume level 0-100
type IsPlaying = boolean;  // Playback state
type IsMuted = boolean;    // Mute state
type IsShuffling = boolean; // Shuffle state
type IsRepeating = boolean; // Repeat state
```

---

## Events

### Playback Events

#### `play`
Fired when playback starts.
```typescript
player.on('play', () => {
  console.log('Playback started');
});
```

#### `pause`
Fired when playback is paused.
```typescript
player.on('pause', () => {
  console.log('Playback paused');
});
```

#### `stop`
Fired when playback is stopped.
```typescript
player.on('stop', () => {
  console.log('Playback stopped');
});
```

#### `ended`
Fired when a track finishes playing.
```typescript
player.on('ended', (audioElement: HTMLAudioElement) => {
  console.log('Track ended');
});
```

### Track Events

#### `song`
Fired when the current track changes.
```typescript
player.on('song', (track: BasePlaylistItem | null) => {
  if (track) {
    console.log(`Now playing: ${track.name} by ${track.artist_track[0].name}`);
  } else {
    console.log('No track selected');
  }
});
```

#### `queue`
Fired when the queue is modified.
```typescript
player.on('queue', (tracks: BasePlaylistItem[]) => {
  console.log(`Queue updated: ${tracks.length} tracks`);
});
```

#### `backlog`
Fired when the backlog changes.
```typescript
player.on('backlog', (tracks: BasePlaylistItem[]) => {
  console.log(`Backlog: ${tracks.length} previously played tracks`);
});
```

### Time Events

#### `time`
Fired during playback with time information.
```typescript
player.on('time', (timeState: TimeState) => {
  console.log(`${timeState.position}s / ${timeState.duration}s (${timeState.percentage}%)`);
});
```

#### `duration`
Fired when track duration is available.
```typescript
player.on('duration', (seconds: number) => {
  console.log(`Track duration: ${seconds}s`);
});
```

#### `seeked`
Fired after seeking to a new position.
```typescript
player.on('seeked', (timeState: TimeState) => {
  console.log(`Seeked to ${timeState.position}s`);
});
```

### Audio Events

#### `volume`
Fired when volume changes.
```typescript
player.on('volume', (level: number) => {
  console.log(`Volume: ${level}%`);
});
```

#### `mute`
Fired when mute state changes.
```typescript
player.on('mute', (isMuted: boolean) => {
  console.log(`Muted: ${isMuted}`);
});
```

### Mode Events

#### `shuffle`
Fired when shuffle mode changes.
```typescript
player.on('shuffle', (enabled: boolean) => {
  console.log(`Shuffle: ${enabled ? 'ON' : 'OFF'}`);
});
```

#### `repeat`
Fired when repeat mode changes.
```typescript
player.on('repeat', (mode: RepeatState) => {
  console.log(`Repeat: ${mode.toUpperCase()}`);
});
```

### System Events

#### `ready`
Fired when the player is fully initialized.
```typescript
player.on('ready', () => {
  console.log('Player ready');
  // Safe to start loading tracks
});
```

#### `error`
Fired when an error occurs.
```typescript
player.on('error', (audioElement: HTMLAudioElement) => {
  console.error('Playback error occurred');
});
```

#### `loadstart`
Fired when loading starts.
```typescript
player.on('loadstart', (audioElement: HTMLAudioElement) => {
  console.log('Loading started');
});
```

#### `waiting`
Fired when buffering.
```typescript
player.on('waiting', (audioElement: HTMLAudioElement) => {
  console.log('Buffering...');
});
```

---

## Methods

### Playback Control

#### `play(): Promise<void>`
Starts playback of the current track.
```typescript
try {
  await player.play();
  console.log('Playback started successfully');
} catch (error) {
  console.error('Failed to start playback:', error);
}
```

#### `pause(): void`
Pauses the current playback.
```typescript
player.pause();
```

#### `stop(): void`
Stops playback and clears the current song.
```typescript
player.stop();
// Triggers 'stop' event and clears queue
```

#### `togglePlayback(): void`
Toggles between play and pause.
```typescript
player.togglePlayback();
```

#### `seek(time: number): void`
Seeks to a specific time position.
```typescript
player.seek(120); // Seek to 2 minutes
```

### Volume Control

#### `setVolume(volume: number): void`
Sets the playback volume (0-100).
```typescript
player.setVolume(75); // Set to 75%
```

#### `getVolume(): number`
Gets the current volume level.
```typescript
const currentVolume = player.getVolume();
console.log(`Current volume: ${currentVolume}%`);
```

#### `mute(): void`
Mutes the audio.
```typescript
player.mute();
```

#### `unmute(): void`
Unmutes the audio.
```typescript
player.unmute();
```

#### `toggleMute(): void`
Toggles mute state.
```typescript
player.toggleMute();
```

### Queue Management

#### `setQueue(tracks: T[]): void`
Replaces the entire queue.
```typescript
const newPlaylist = [track1, track2, track3];
player.setQueue(newPlaylist);
```

#### `addToQueue(track: T): void`
Adds a track to the end of the queue.
```typescript
player.addToQueue(newTrack);
```

#### `addToQueueNext(track: T): void`
Adds a track to play next.
```typescript
player.addToQueueNext(urgentTrack);
```

#### `removeFromQueue(track: T): void`
Removes a specific track from the queue.
```typescript
player.removeFromQueue(unwantedTrack);
```

#### `getQueue(): T[]`
Returns the current queue.
```typescript
const currentQueue = player.getQueue();
console.log(`${currentQueue.length} tracks in queue`);
```

#### `next(): void`
Skips to the next track.
```typescript
player.next();
```

#### `previous(): void`
Goes to the previous track or restarts current track.
```typescript
player.previous();
// If < 3 seconds played: goes to previous track
// If > 3 seconds played: restarts current track
```

#### `playTrack(track: T, tracks?: T[]): void`
Plays a specific track and optionally sets the queue.
```typescript
// Play single track
player.playTrack(selectedTrack);

// Play track from album and set remaining as queue
player.playTrack(albumTracks[3], albumTracks);
```

### Playback Modes

#### `shuffle(enabled: boolean): void`
Enables or disables shuffle mode.
```typescript
player.shuffle(true);  // Enable shuffle
player.shuffle(false); // Disable shuffle
```

#### `repeat(mode: RepeatState): void`
Sets the repeat mode.
```typescript
player.repeat('off');  // No repeat
player.repeat('one');  // Repeat current track
player.repeat('all');  // Repeat queue
```

### Audio Configuration

#### `setBaseUrl(url: string): void`
Sets the base URL for media files.
```typescript
player.setBaseUrl('https://cdn.musicservice.com/');
```

#### `setAccessToken(token: string): void`
Sets the access token for authenticated requests.
```typescript
player.setAccessToken('eyJhbGciOiJIUzI1NiIs...');
```

### Equalizer

#### `setFilter(filter: EQBand): void`
Adjusts a specific frequency band.
```typescript
player.setFilter({ frequency: 1000, gain: 5 }); // Boost 1kHz by 5dB
```

#### `setPreGain(gain: number): void`
Sets the pre-amplification level.
```typescript
player.setPreGain(2); // +2dB preamp
```

#### `setPanner(pan: number): void`
Sets stereo panning (-1 to 1).
```typescript
player.setPanner(-0.5); // Pan 50% to the left
player.setPanner(0);    // Center
player.setPanner(1);    // Full right
```

#### `saveEqualizerSettings(): void`
Saves current EQ settings to localStorage.
```typescript
player.saveEqualizerSettings();
```

#### `loadEqualizerSettings(): void`
Loads EQ settings from localStorage.
```typescript
player.loadEqualizerSettings();
```

### Utility Methods

#### `getDuration(): number`
Gets the current track duration.
```typescript
const duration = player.getDuration();
console.log(`Track is ${duration} seconds long`);
```

#### `getCurrentTime(): number`
Gets the current playback position.
```typescript
const position = player.getCurrentTime();
console.log(`Currently at ${position} seconds`);
```

#### `getBuffer(): number`
Gets the current buffer percentage.
```typescript
const buffered = player.getBuffer();
console.log(`${buffered}% buffered`);
```

#### `getTimeData(): TimeState`
Gets comprehensive time information.
```typescript
const timeData = player.getTimeData();
console.log(`Position: ${timeData.position}/${timeData.duration} (${timeData.percentage}%)`);
```

#### `setAutoPlayback(enabled: boolean): void`
Controls automatic queue advancement.
```typescript
player.setAutoPlayback(false); // Disable auto-advance
```

#### `dispose(): void`
Cleans up resources and removes event listeners.
```typescript
player.dispose();
// Call when removing player from application
```

---

## Configuration

### Spectrum Analyzer Configuration

The `motionConfig` accepts all [AudioMotion-Analyzer options](https://github.com/hvianna/audioMotion-analyzer#constructor):

```typescript
const motionConfig: ConstructorOptions = {
  // Visualization mode
  mode: 2,                    // 0=bands, 1=octave, 2=1/3 octave, 3=1/6 octave, etc.
  
  // Frequency analysis
  fftSize: 16384,            // FFT size (higher = more detail)
  minFreq: 30,               // Minimum frequency (Hz)
  maxFreq: 16000,            // Maximum frequency (Hz)
  
  // Visual appearance  
  barSpace: 0.25,            // Space between bars (0-1)
  channelLayout: "dual-horizontal", // Channel display mode
  colorMode: "bar-level",    // Color scheme
  
  // Performance
  maxFPS: 60,                // Maximum frame rate
  smoothing: 0.7,            // Frequency smoothing (0-1)
  
  // Advanced
  alphaBars: true,           // Transparent bars
  ledBars: false,            // LED-style bars
  lumiBars: false,           // Luminance bars
  radial: false,             // Radial visualization
  reflexRatio: 0.5,          // Reflection intensity
};
```

### Common Configurations

#### Minimal Setup
```typescript
const player = new MusicPlayer({
  siteTitle: 'Music Player'
});
```

#### Full-Featured Setup
```typescript
const player = new MusicPlayer({
  baseUrl: 'https://api.example.com/media/',
  siteTitle: 'Premium Music Experience',
  expose: true,
  disableAutoPlayback: false,
  motionConfig: {
    mode: 2,
    fftSize: 16384,
    barSpace: 0.1,
    channelLayout: "dual-horizontal",
    colorMode: "bar-level",
    smoothing: 0.8,
    maxFPS: 60,
  },
  motionColors: [
    '#ff0066', '#ff3366', '#ff6666', 
    '#ff9966', '#ffcc66', '#ffff66',
    '#ccff66', '#99ff66', '#66ff66'
  ],
  actions: {
    play: () => updateMediaSessionPlaybackState('playing'),
    pause: () => updateMediaSessionPlaybackState('paused'),
    stop: () => updateMediaSessionPlaybackState('none'),
    seek: (time) => handleCustomSeek(time),
  }
});
```

---

## Examples

### Basic Music Player Implementation

```typescript
import { MusicPlayer } from '@nomercy-entertainment/nomercy-music-player';
import type { BasePlaylistItem } from '@nomercy-entertainment/nomercy-music-player/dist/types';

interface MyTrack extends BasePlaylistItem {
  id: string;
  cover?: string;
  duration: number;
}

class MyMusicPlayer {
  private player: MusicPlayer<MyTrack>;
  
  constructor() {
    this.player = new MusicPlayer({
      baseUrl: 'https://cdn.example.com/',
      siteTitle: 'My Music App',
      expose: false
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.player.on('ready', () => this.onReady());
    this.player.on('song', (track) => this.onTrackChange(track));
    this.player.on('time', (timeState) => this.onTimeUpdate(timeState));
    this.player.on('error', () => this.onError());
  }
  
  private onReady() {
    console.log('Player is ready');
    this.loadInitialPlaylist();
  }
  
  private onTrackChange(track: MyTrack | null) {
    if (track) {
      this.updateUI(track);
      this.updateWindowTitle(track);
    }
  }
  
  private onTimeUpdate(timeState: TimeState) {
    this.updateProgressBar(timeState.percentage);
    this.updateTimeDisplay(timeState.position, timeState.duration);
  }
  
  private onError() {
    console.error('Playback error - skipping to next track');
    this.player.next();
  }
  
  public loadPlaylist(tracks: MyTrack[]) {
    this.player.setQueue(tracks);
  }
  
  public playTrack(track: MyTrack) {
    this.player.playTrack(track);
  }
  
  // UI update methods
  private updateUI(track: MyTrack) { /* Update DOM */ }
  private updateProgressBar(percentage: number) { /* Update progress */ }
  private updateTimeDisplay(current: number, total: number) { /* Update time */ }
  private updateWindowTitle(track: MyTrack) { /* Update title */ }
  private loadInitialPlaylist() { /* Load default playlist */ }
}
```

### Advanced Queue Management

```typescript
class AdvancedQueueManager {
  private player: MusicPlayer<MyTrack>;
  private queueHistory: MyTrack[][] = [];
  
  constructor(player: MusicPlayer<MyTrack>) {
    this.player = player;
    this.setupQueueListeners();
  }
  
  private setupQueueListeners() {
    this.player.on('queue', (tracks) => {
      this.saveQueueState(tracks);
      this.updateQueueUI(tracks);
    });
  }
  
  public addAlbumToQueue(album: MyTrack[]) {
    album.forEach(track => this.player.addToQueue(track));
  }
  
  public insertAfterCurrent(track: MyTrack) {
    this.player.addToQueueNext(track);
  }
  
  public moveTrackInQueue(from: number, to: number) {
    const queue = this.player.getQueue();
    const track = queue.splice(from, 1)[0];
    queue.splice(to, 0, track);
    this.player.setQueue(queue);
  }
  
  public clearQueueAfterCurrent() {
    this.player.setQueue([]);
  }
  
  public saveCurrentQueueAsPlaylist(name: string) {
    const queue = this.player.getQueue();
    const currentSong = this.player.currentSong;
    
    const playlist = currentSong ? [currentSong, ...queue] : queue;
    this.savePlaylist(name, playlist);
  }
  
  private saveQueueState(tracks: MyTrack[]) {
    this.queueHistory.push([...tracks]);
    // Keep only last 10 states
    if (this.queueHistory.length > 10) {
      this.queueHistory.shift();
    }
  }
  
  private updateQueueUI(tracks: MyTrack[]) { /* Update queue display */ }
  private savePlaylist(name: string, tracks: MyTrack[]) { /* Save to storage */ }
}
```

### Custom Equalizer Interface

```typescript
class EqualizerManager {
  private player: MusicPlayer<BasePlaylistItem>;
  private customPresets: EqualizerPreset[] = [];
  
  constructor(player: MusicPlayer<BasePlaylistItem>) {
    this.player = player;
    this.loadCustomPresets();
  }
  
  public applyPreset(presetName: string) {
    const preset = this.findPreset(presetName);
    if (preset) {
      preset.values.forEach(band => {
        this.player.setFilter(band);
      });
    }
  }
  
  public createCustomPreset(name: string, bands: EQBand[]) {
    const preset: EqualizerPreset = {
      name,
      values: bands.map(b => ({
        frequency: b.frequency as number,
        gain: b.gain
      }))
    };
    
    this.customPresets.push(preset);
    this.saveCustomPresets();
  }
  
  public setBandGain(frequency: number, gain: number) {
    this.player.setFilter({ frequency, gain });
    this.updateBandUI(frequency, gain);
  }
  
  public resetToFlat() {
    this.player.equalizerBands.forEach(band => {
      if (band.frequency !== 'Pre') {
        this.player.setFilter({ frequency: band.frequency, gain: 0 });
      }
    });
    this.player.setPreGain(0);
  }
  
  public getFrequencyBands(): number[] {
    return this.player.equalizerBands
      .filter(band => band.frequency !== 'Pre')
      .map(band => band.frequency as number);
  }
  
  private findPreset(name: string): EqualizerPreset | undefined {
    return [...this.player.equalizerPresets, ...this.customPresets]
      .find(preset => preset.name === name);
  }
  
  private loadCustomPresets() {
    const saved = localStorage.getItem('custom-eq-presets');
    if (saved) {
      this.customPresets = JSON.parse(saved);
    }
  }
  
  private saveCustomPresets() {
    localStorage.setItem('custom-eq-presets', JSON.stringify(this.customPresets));
  }
  
  private updateBandUI(frequency: number, gain: number) { /* Update slider UI */ }
}
```

---

This comprehensive API documentation covers all aspects of the NoMercy Music Player. For more examples and advanced usage patterns, please refer to the [GitHub Wiki](https://github.com/NoMercy-Entertainment/NoMercyMusicPlayer/wiki).