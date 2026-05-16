# Equalizer

The equalizer is an opt-in plugin built on the Web Audio API. It provides parametric EQ with preset management.

---

## Requirements

`EqualizerPlugin` requires `AudioGraphPlugin` as a dependency. Register `AudioGraphPlugin` first.

```ts
import {
  nmMPlayer,
  AudioGraphPlugin,
  EqualizerPlugin,
} from '@nomercy-entertainment/nomercy-music-player';

const player = nmMPlayer('main').setup({ ... });

player
  .addPlugin(AudioGraphPlugin)
  .addPlugin(EqualizerPlugin, {
    preGain: 0,         // dB, applied before the filter chain
    presets: [
      {
        name: 'Rock',
        bands: [5, 3, 0, -1, -1, 0, 3, 3, 3, 1],
      },
    ],
  });
```

---

## Band configuration

The EQ operates on 10 standard frequency bands (in Hz):

```
32 | 64 | 125 | 250 | 500 | 1k | 2k | 4k | 8k | 16k
```

Each band value is in decibels (dB). `0` is flat. Typical range: -12 to +12.

---

## Methods

Access the plugin via `player.getPlugin(EqualizerPlugin)`:

```ts
const eq = player.getPlugin(EqualizerPlugin);
```

### `setBand(index, gain)`

```ts
eq.setBand(index: number, gain: number): Promise<void>
```

Set the gain for a band at `index` (0–9). `gain` is in dB.

```ts
await eq.setBand(0, 5);   // boost 32Hz by 5dB
await eq.setBand(9, -3);  // cut 16kHz by 3dB
```

### `getBand(index)`

```ts
eq.getBand(index: number): number
```

Return the current gain for a band.

### `bands()`

```ts
eq.bands(): number[]
```

Return all 10 band values as a `number[]`.

### `bands(values)`

```ts
eq.bands(values: number[]): Promise<void>
```

Set all 10 bands at once.

### `setPreGain(gain)`

```ts
eq.setPreGain(gain: number): Promise<void>
```

Set the pre-gain (dB), applied to the signal before it reaches the filter chain.

### `getPreGain()`

```ts
eq.getPreGain(): number
```

### `reset()`

```ts
eq.reset(): void
```

Reset all bands to 0 and pre-gain to 0.

### `setPreset(name)`

```ts
eq.setPreset(name: string): Promise<void>
```

Apply a named preset from the presets registered at `addPlugin`.

### `getPreset()`

```ts
eq.getPreset(): string | undefined
```

Name of the active preset, or `undefined` if bands were manually set.

### `presets()`

```ts
eq.presets(): EqPreset[]
```

All available presets.

---

## Events

Listen via `player.on(EqualizerPlugin, eventName, handler)`:

| Event | Payload | Fires when |
|-------|---------|-----------|
| `bandChanged` | `{ index: number; gain: number }` | A band gain changes |
| `preGainChanged` | `{ gain: number }` | Pre-gain changes |
| `presetApplied` | `{ name: string }` | A preset is applied |
| `reset` | `void` | EQ reset to flat |
| `beforeSetBand` | `BeforeEvent<{ index, gain }>` | Before a band changes — cancellable |

```ts
player.on(EqualizerPlugin, 'bandChanged', ({ index, gain }) => {
  updateBandSlider(index, gain);
});
```

---

## Saving and restoring presets

EQ state is automatically persisted to the configured `IStorage` backend under the player's namespace. On next initialization, the EQ restores its previous state.

To export the current state for sharing:

```ts
const eq = player.getPlugin(EqualizerPlugin);
const snapshot = eq.state(); // { id, enabled, opts, runtime: { bands, preGain, presetName } }
```

To restore:

```ts
eq.bands(snapshot.runtime.bands);
eq.setPreGain(snapshot.runtime.preGain);
```

---

## Relationship to AudioGraphPlugin

`AudioGraphPlugin` owns the Web Audio routing graph — the signal chain from the audio source to the speakers. `EqualizerPlugin` inserts `BiquadFilterNode` nodes into that chain.

If `AudioGraphPlugin` is disabled or removed, `EqualizerPlugin` is automatically disabled via the dependency cascade.

`MixerPlugin` (per-track gain) and `SpectrumPlugin` (frequency analysis) also attach to `AudioGraphPlugin`'s chain. Their order in the chain follows plugin registration order.
