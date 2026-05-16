# Lyrics

Synced lyric display is provided by `LyricsPlugin`. It reads timed lyric cues from a `ILyricSource` adapter and emits cue-change events as the track plays.

---

## Setup

```ts
import {
  nmMPlayer,
  LyricsPlugin,
} from '@nomercy-entertainment/nomercy-music-player';
import { LrcFileLyricSource } from '@nomercy-entertainment/nomercy-music-player/adapters/lyric-source';

const player = nmMPlayer('main').setup({
  queue: [
    {
      id: '1',
      name: 'Track',
      url: 'https://cdn.example.com/track.m3u8',
      lyricsUrl: 'https://cdn.example.com/lyrics/1.lrc', // per-track URL
    },
  ],
});

player.addPlugin(LyricsPlugin);
```

The `LrcFileLyricSource` adapter (the default) reads the `lyricsUrl` field from the current `MusicPlaylistItem` and fetches + parses the LRC file automatically.

---

## Displaying lyrics

Listen to `plugin:lyrics:cueChange` via the class-form for typed payloads:

```ts
player.on(LyricsPlugin, 'cueChange', ({ line, index, timestamp }) => {
  document.getElementById('lyrics-display').textContent = line ?? '';
});
```

The event fires when the current lyric line changes. `line` is `null` when there is no active cue (between cues or before the first cue).

---

## Events

| Event | Payload | Fires when |
|-------|---------|-----------|
| `cueChange` | `{ line: string \| null; index: number; timestamp: number }` | Current lyric line changes |
| `lyricsLoaded` | `{ trackId: string \| number; lineCount: number }` | Lyrics fetched and parsed for a track |
| `lyricsFailed` | `{ trackId: string \| number; reason: string }` | Lyrics could not be loaded |
| `lyricsUnavailable` | `{ trackId: string \| number }` | Track has no `lyricsUrl` |

---

## LRC format

The `LrcFileLyricSource` parses standard LRC files:

```
[00:12.00] First lyric line
[00:17.20] Second lyric line
[00:22.40] Third lyric line
```

Enhanced LRC (word-level timestamps) is supported when the cue parser registry has an LRC word-level parser registered. The kit ships `parseLrc` from `@nomercy-entertainment/nomercy-player-core/cues/parsers/lrc`.

---

## Custom lyric source

Implement `ILyricSource` to fetch lyrics from a database, API, or embedded metadata:

```ts
import type { ILyricSource, LyricCue } from '@nomercy-entertainment/nomercy-music-player';

class MyApiLyricSource implements ILyricSource {
  async getLyrics(trackId: string | number): Promise<LyricCue[]> {
    const response = await fetch(`/api/lyrics/${trackId}`);
    const data = await response.json();
    return data.lines.map((line: { time: number; text: string }) => ({
      startMs: line.time * 1000,
      text: line.text,
    }));
  }
}

// Inject via setup:
player.setup({
  lyricSource: new MyApiLyricSource(),
});
```

`ILyricSource` has a single method:

```ts
interface ILyricSource {
  getLyrics(trackId: string | number, item: MusicPlaylistItem): Promise<LyricCue[]>;
}
```

`getLyrics` is called when the current track changes. Return an empty array if no lyrics are available for a track.

---

## Scrolling lyrics UI

A minimal scrolling lyric display in vanilla JS:

```ts
const lyricsEl = document.getElementById('lyrics');
let allLines: string[] = [];
let currentIndex = -1;

player.on(LyricsPlugin, 'lyricsLoaded', ({ lineCount }) => {
  // Fetch all lines from the plugin if needed, or buffer from cueChange events
  allLines = [];
  currentIndex = -1;
});

player.on(LyricsPlugin, 'cueChange', ({ line, index }) => {
  if (line === null) return;

  currentIndex = index;

  // Highlight current line, scroll into view:
  const lineEls = lyricsEl.querySelectorAll('.lyric-line');
  lineEls.forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  lineEls[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
```

---

## Cue parser registry

`LyricsPlugin` uses the kit's cue parser registry to decode lyric files. The kit ships an LRC parser by default. Register additional parsers to support custom formats:

```ts
import { parseLrc } from '@nomercy-entertainment/nomercy-player-core/cues/parsers/lrc';

// Registered by default — no code needed for LRC.
// To add a custom format:
player.registerCueParser({
  canParse: (url) => url.endsWith('.mylyrics'),
  parse: (text) => myCustomParser(text),
});
```
