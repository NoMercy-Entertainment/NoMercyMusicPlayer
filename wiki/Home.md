# nomercy-music-player — Documentation Home

Headless reference music player built on `nomercy-player-core`. Ships a dual-buffer WebAudio crossfade engine, a pluggable adapter system, and a typed plugin framework.

---

## What this package provides

- `NMMusicPlayer<T>` — the core class. Generic over your track type.
- `nmMPlayer(id)` — factory that creates or retrieves a named player instance.
- Six music-specific adapter ports (audio backend, playlist generator, scrobbler, lyric source, similarity engine, now-playing art).
- Eighteen built-in plugins (crossfade, auto-advance, group listening, EQ, spectrum, lyrics, MediaSession, and more).
- Full TypeScript types for all public methods, events, and configuration.

---

## Quick navigation

| Topic | Page |
|-------|------|
| Install + first track | [Quick Start](Quick-Start.md) |
| All config options | [Configuration](Configuration.md) |
| Writing plugins | [Plugin Development](Plugin-Development.md) |
| Vue integration | [Framework — Vue](Framework-Vue.md) |
| React integration | [Framework — React](Framework-React.md) |
| All events + payload shapes | [Events](Events.md) |
| All public methods | [API Methods](API-Methods.md) |
| Crossfade | [Crossfade](Crossfade.md) |
| Equalizer | [Equalizer](Equalizer.md) |
| Lyrics | [Lyrics](Lyrics.md) |
| Migrating from v1 | [MIGRATION.md](../MIGRATION.md) |
| Kit adapter catalog | [nomercy-player-kit MIGRATION.md](../../nomercy-player-kit/MIGRATION.md) |

---

## Package coordinates

```
npm install @nomercy-entertainment/nomercy-music-player
```

npm name: `@nomercy-entertainment/nomercy-music-player`
GitHub: [NoMercy-Entertainment/nomercy-music-player](https://github.com/NoMercy-Entertainment/nomercy-music-player)

---

## Architecture in one diagram

```
Your track type (T extends MusicPlaylistItem)
       |
NMMusicPlayer<T>        ← per-library layer (music concerns only)
       |
nomercy-player-core     ← kit (generic: queue, auth, plugins, i18n, storage)
       |
IAudioBackend           ← backend layer (WebAudioBackend / AudioElementBackend)
       |
Web Audio API / <audio>
```

Everything below `NMMusicPlayer<T>` is generic — zero knowledge of your server API, your track shape beyond the typed fields, or any NoMercy infrastructure. App-specific glue lives in layer-5 consumer plugins.
