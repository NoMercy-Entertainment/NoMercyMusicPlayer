# @nomercy-entertainment/nomercy-music-player

> Headless, plugin-driven music player engine. HLS-ready, crossfade-capable, externally-orchestratable, leak-tested.

## Status

**v2.0.0-alpha — pre-alpha.** API surface stubbed; no functionality yet.
Tracking the design at branch `feature/api-unification-consolidation`.

## Quick start (planned shape)

```ts
import nmMPlayer from '@nomercy-entertainment/nomercy-music-player';
import {
  autoAdvancePlugin,
  mediaSessionPlugin,
  tabLeaderPlugin,
  keyHandlerPlugin,
} from '@nomercy-entertainment/nomercy-music-player/plugins';

interface MyTrack { id: string; name: string; cover?: string; lyricsUrl?: string }

const player = nmMPlayer<MyTrack>('player')
  .setup({ siteTitle: 'My App', baseUrl: '/api' })
  .usePlugin(autoAdvancePlugin)
  .usePlugin(mediaSessionPlugin)
  .usePlugin(tabLeaderPlugin)
  .usePlugin(keyHandlerPlugin);

player.setQueue(tracks);
player.play();
```

## Architecture

Built on top of `@nomercy-entertainment/nomercy-player-core` — the shared spine
both NoMercy player libraries use. Plugin runtime, event system, lifecycle
helpers, DOM helpers, stream protocol abstraction (HLS via `hls.js`),
time-indexed cue lists (lyrics, sprite previews, subtitles in the video lib),
and tab-leader/key-handler/media-session base plugins all live there.

This package adds the music-specific layer: audio backends (audio-element +
webaudio), crossfade, queue, equalizer plugin, spectrum plugin, lyrics
plugin, and the `nmMPlayer` factory.

## License

Apache-2.0
