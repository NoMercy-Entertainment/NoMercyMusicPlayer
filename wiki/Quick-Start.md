# Quick Start

---

## Install

```
npm install @nomercy-entertainment/nomercy-music-player
```

Requires Node 18+ for tooling. Runs in any modern browser.

---

## Minimal working player

```ts
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { AutoAdvancePlugin, MediaSessionPlugin } from '@nomercy-entertainment/nomercy-music-player';

const player = nmMPlayer('main').setup({
  queue: [
    {
      id: '1',
      name: 'Track One',
      url: 'https://cdn.example.com/track1.m3u8',
    },
    {
      id: '2',
      name: 'Track Two',
      url: 'https://cdn.example.com/track2.m3u8',
    },
  ],
});

player
  .addPlugin(AutoAdvancePlugin)
  .addPlugin(MediaSessionPlugin);

await player.ready();
await player.play();
```

That is a working music player. `AutoAdvancePlugin` advances the queue when a track ends. `MediaSessionPlugin` wires lock screen and notification controls.

---

## Play, pause, and transport

```ts
await player.play();
await player.pause();
await player.stop();
await player.togglePlayback();

await player.next();
await player.previous();
await player.restart();
```

All transport methods return `Promise<void>`. They are safe to call without awaiting if you don't need to sequence work after them.

---

## Queue management

```ts
// Replace the entire queue:
player.queue([track1, track2, track3]);

// Read the queue:
const tracks = player.queue(); // ReadonlyArray<T>

// Append:
player.queueAppend(track4);

// Prepend (play next):
player.queuePrepend(track4);

// Remove by id:
player.queueRemove('4');

// Move a track:
player.queueMove(fromIndex, toIndex);

// Jump to a track:
player.current(track2);

// Read current:
const current = player.current(); // T | undefined
```

---

## Volume

```ts
player.volume(0.8);      // set to 80%
const vol = player.volume(); // read
player.mute();
player.unmute();
player.toggleMute();
player.volumeUp(0.05);
player.volumeDown(0.05);
```

---

## Shuffle and repeat

```ts
import { ShuffleState, RepeatState } from '@nomercy-entertainment/nomercy-music-player';

player.shuffleState(ShuffleState.On);
player.shuffleState(ShuffleState.Off);

player.repeatState(RepeatState.Off);
player.repeatState(RepeatState.One);
player.repeatState(RepeatState.All);
```

---

## Seeking

```ts
player.currentTime(30);         // seek to 30 seconds
const pos = player.currentTime(); // read position
const dur = player.duration();    // total duration

player.forward(10);              // skip forward 10s
player.rewind(10);               // skip back 10s
player.seekByPercentage(0.5);    // jump to midpoint
```

---

## Listening to events

```ts
player.on('current', ({ item, index }) => {
  console.log('Now playing:', item.name, 'at index', index);
});

player.on('time', ({ time }) => {
  updateProgressBar(time / player.duration());
});

player.on('play', () => { /* started */ });
player.on('pause', () => { /* paused */ });
player.on('ended', () => { /* track finished */ });
player.on('ready', () => { /* setup complete */ });
```

See [Events](Events.md) for the full list and payload shapes.

---

## Authentication

If your audio sources require an `Authorization` header:

```ts
const player = nmMPlayer('main').setup({
  auth: {
    bearerToken: () => myAuth.getAccessToken(),
    refreshOnUnauthenticated: async () => {
      await myAuth.refresh();
      return myAuth.getAccessToken();
    },
  },
});
```

The player injects `Authorization: Bearer <token>` on every HLS manifest and segment request. On a 401, it calls `refreshOnUnauthenticated` once and retries. On a 403, the error propagates — do not retry.

---

## What to read next

- [Configuration](Configuration.md) — all config options explained
- [Crossfade](Crossfade.md) — the signature music feature
- [Plugin Development](Plugin-Development.md) — extend the player
- [Events](Events.md) — full event reference
- [API Methods](API-Methods.md) — full method reference
