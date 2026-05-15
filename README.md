# nomercy-music-player

Headless reference music player built on nomercy-player-core. Adapter-driven.

```
npm install @nomercy-entertainment/nomercy-music-player
```

---

## Quick start

```ts
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { LocalStorageBackend } from '@nomercy-entertainment/nomercy-player-core';
import { AutoAdvancePlugin, LyricsPlugin, MediaSessionPlugin } from '@nomercy-entertainment/nomercy-music-player';

const player = nmMPlayer('player-1').setup({
  accessToken: () => myAuth.getToken(),
  storage: new LocalStorageBackend(),
  backend: 'webaudio',
  queue: [
    {
      id: '1',
      url: 'https://cdn.example.com/track.m3u8',
      title: 'My Track',
      artist: 'Artist Name',
    },
  ],
});

player
  .addPlugin(AutoAdvancePlugin)
  .addPlugin(LyricsPlugin)
  .addPlugin(MediaSessionPlugin);

await player.ready();
await player.play();
```

---

## Adapter catalog

Six music-specific ports extend the 28 kit ports.

| Port | Interface | Default adapters | Description |
|------|-----------|-----------------|-------------|
| audio-backend | `IAudioBackend` | `WebAudioBackend` (default), `AudioElementBackend` (fallback) | Audio element management, HLS loading, crossfade dual-buffer, track events. Switch at runtime via `player.backend('webaudio')` or `player.backend('audio-element')` |
| playlist-generator | `IPlaylistGenerator` | `linear` (sequential order), `smart-shuffle` (tag-aware shuffle) | Determines queue order — swap for server-driven ordering or weighted random |
| similarity-engine | `ISimilarityEngine` | port only — consumer required | Drives radio-mode style "more like this" playlist extension; no default because similarity data is always server-specific |
| scrobbler | `IScrobbler` | `noop` (default, silent) | Reports playback events to Last.fm, ListenBrainz, or a custom endpoint |
| lyric-source | `ILyricSource` | `lrc-file` (fetches and parses an LRC file by URL) | Provides timed lyric cues to the `LyricsPlugin` |
| now-playing-art | `INowPlayingArt` | `media-session` (reads artwork from the Media Session API) | Resolves album art for the current track — swap for a server API or a local cache |

---

## Built-in plugins

| Plugin | Class | Description |
|--------|-------|-------------|
| music-ui | `MusicUiPlugin` | Player chrome for music — progress, controls, queue panel |
| auto-advance | `AutoAdvancePlugin` | Advances to the next track on `ended`; respects repeat and shuffle state |
| cast-sender | `CastSenderPlugin` | Google Cast sender integration for Chromecast handoff |
| drm | `DrmPlugin` | EME key-system and license server orchestration |
| embed | `EmbedPlugin` | postMessage bridge for iframe-embedded players (via kit) |
| group-listening | `GroupListeningPlugin` | Multi-user synchronized playback via the realtime adapter |
| key-handler | `KeyHandlerPlugin` | Keyboard shortcut routing (via kit) |
| live-transcoding | `LiveTranscodingPlugin` | Server-driven live transcode delivery |
| lyrics | `LyricsPlugin` | Timed lyric display driven by `ILyricSource` and cue events |
| media-session | `MediaSessionPlugin` | Media Session API integration — lock screen and notification controls (via kit) |
| message | `MessagePlugin` | Cross-window event bridge (via kit) |
| tab-leader | `TabLeaderPlugin` | Single-tab audio leadership — pauses in background tabs when another takes over (via kit) |
| audio-graph | `AudioGraphPlugin` | Web Audio routing graph (via kit) — prerequisite for EQ, mixer, and spectrum |
| equalizer | `EqualizerPlugin` | Parametric EQ with presets (via kit, requires `AudioGraphPlugin`) |
| mixer | `MixerPlugin` | Per-track gain control (via kit, requires `AudioGraphPlugin`) |
| spectrum | `SpectrumPlugin` | Frequency-domain analyser (via kit, requires `AudioGraphPlugin`) |
| canvas | `CanvasPlugin` | Shared canvas surface for visualization (via kit) |
| visualization | `VisualizationPlugin` | rAF-driven rendering callbacks for canvas visualizers (via kit) |

---

## Server-as-player mode (post-v2 milestone M1)

The music player's adapter architecture is designed to support a server-driven sync mode: a WebSocket audio backend that streams audio state from the server, a server-mirrored media list, a server-synced clock, and a server-driven playlist. In this mode the server is the source of truth for playback position, queue, and transitions — clients follow.

This implementation lives in consumer plugins (`nomercy-plugins/nomercy-sync/`), not in this package. The music player itself has no knowledge of NoMercy server protocols. The adapter ports — `IAudioBackend`, `IPlaylistGenerator`, `IClock`, `IRealtimeChannel` — are the extension points that make it possible.

---

## License

Apache-2.0

Repository: [github.com/NoMercy-Entertainment/nomercy-music-player](https://github.com/NoMercy-Entertainment/nomercy-music-player)
