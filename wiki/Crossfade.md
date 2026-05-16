# Crossfade

Crossfade is the signature feature of the music player. It smoothly transitions between two tracks by fading one out while fading the other in, using a dual-buffer audio architecture in the `WebAudioBackend`.

---

## How it works

The `WebAudioBackend` maintains two audio elements. The "primary" element plays the current track. When a crossfade begins, the secondary element starts loading and playing the incoming track while its gain ramps up. Simultaneously, the primary element's gain ramps down. When the fade completes, roles swap: the incoming track becomes primary.

The gain ramping uses the Web Audio API's `GainNode`. Two curve types are supported:

- `'equal-power'` — the sum of the two gain curves is constant. Perceived loudness stays stable throughout the transition. Recommended for most music.
- `'linear'` — simple linear ramp. Can produce a brief perceived volume dip at the midpoint.

---

## Configuration

Set crossfade defaults at setup time:

```ts
const player = nmMPlayer('main').setup({
  crossfadeEnabled: true,
  crossfadeDefaults: {
    durationMs: 4000,
    curve: 'equal-power',
    startAt: 4, // seconds before track end to trigger automatic crossfade
  },
});
```

`crossfadeEnabled` is `false` by default. `AutoAdvancePlugin` reads this value to decide whether to use a crossfade transition or an immediate skip when a track ends.

---

## Triggering a crossfade

### Manual crossfade

```ts
await player.crossfadeTo(nextTrack, {
  durationMs: 3000,
  curve: 'equal-power',
});
```

This starts the crossfade immediately to a specific track. The track does not need to be in the queue first. After the crossfade completes, the incoming track becomes current.

### Automatic crossfade via AutoAdvancePlugin

```ts
player.addPlugin(AutoAdvancePlugin, {
  crossfadeOnEnd: true, // use crossfade instead of immediate next()
});
```

With `crossfadeOnEnd: true`, `AutoAdvancePlugin` calls `crossfadeTo(peekNext())` when `trackEndingSoon` fires (controlled by `trackEndingSoonThreshold`). This gives the fade time to complete before the track ends.

### Server-triggered crossfade

For server-orchestrated crossfades (e.g. radio mode, group listening), listen to your realtime channel and call `crossfadeTo`:

```ts
signalRConnection.on('CrossfadeNow', ({ nextTrack, durationMs }) => {
  player.crossfadeTo(nextTrack, { durationMs });
});
```

The server should send this signal `durationMs` milliseconds before the target transition point to account for network latency.

---

## Monitoring crossfade state

```ts
player.on('crossfadeStart', ({ from, to, duration }) => {
  console.log(`Fading from "${from.name}" to "${to.name}" over ${duration}ms`);
});

player.on('crossfadeComplete', ({ track }) => {
  console.log(`Now playing: ${track.name}`);
});

// Check if a crossfade is in progress:
player.isTransitioning(); // boolean
```

---

## Cancelling a crossfade

No explicit cancel API exists. Starting a new `crossfadeTo()` while one is in progress cancels the previous one.

---

## Requirements

Crossfade requires the `WebAudioBackend`. With `AudioElementBackend`, crossfade calls fall back to an immediate track switch.

Check the active backend before triggering:

```ts
if (player.backend() === 'webaudio') {
  await player.crossfadeTo(nextTrack);
} else {
  player.current(nextTrack);
  await player.play();
}
```

---

## Crossfade and EQ

If `EqualizerPlugin` and `AudioGraphPlugin` are registered, the EQ applies to both audio paths during a crossfade. The outgoing track fades with its EQ applied; the incoming track plays through the same EQ graph from the first sample.

---

## `trackEndingSoon` and preload

The `trackEndingSoon` event fires when the current track has `trackEndingSoonThreshold` seconds remaining. Use it to preload artwork, metadata, or make server calls before the transition:

```ts
player.on('trackEndingSoon', async ({ remaining, currentTrack }) => {
  const nextTrack = player.peekNext();
  if (nextTrack) {
    await prefetchArtwork(nextTrack);
  }
});
```

---

## Crossfade timing notes

The crossfade starts `startAt` seconds before the track ends (defaults to `durationMs / 1000`). The incoming track begins loading at `preloadLeadSeconds` (default: 30s). Ensure `preloadLeadSeconds` is well above `startAt + (typical network latency in seconds)`.

On slow connections, if the incoming track hasn't buffered enough by the time the crossfade starts, the crossfade will wait for the buffer before fading. This adds a brief delay. On very slow connections, `AudioElementBackend` may be more reliable.
