# Plugin Development

This page describes how to write plugins for `nomercy-music-player` v2. The plugin system is shared across the kit, video player, and music player — the same contract applies to all three. This page focuses on music-player-specific concerns and examples.

For the full plugin standard (locking document, lint rules, conformance checklist), see [`.claude/specs/2026-05-07-plugin-standard.md`](../../../../.claude/specs/2026-05-07-plugin-standard.md) in the monorepo.

---

## The five-layer architecture

Plugins live at layers 4 and 5:

| Layer | What lives here |
|-------|----------------|
| 1. Backend | `IAudioBackend` implementations — `WebAudioBackend`, `AudioElementBackend` |
| 2. Kit | `Plugin`, `IPlayer`, lifecycle, queue, auth, i18n, storage |
| 3. Per-library | `NMMusicPlayer<T>`, `MusicPlaylistItem`, music-specific methods |
| 4. Built-in plugin | Kit-shipped and music-shipped plugins (EQ, AutoAdvance, Lyrics, etc.) |
| 5. Consumer plugin | Your app-specific glue — NoMercy Connect, scrobbling, radio mode |

Built-in plugins (layer 4) must have zero knowledge of NoMercy server endpoints, SignalR hub signatures, or anything NoMercy-specific. Consumer plugins (layer 5) are where all of that lives.

---

## Minimal plugin skeleton

```ts
import { Plugin } from '@nomercy-entertainment/nomercy-player-core';
import type { NMMusicPlayer, MusicEventMap } from '@nomercy-entertainment/nomercy-music-player';

// Define your options shape:
interface MyPluginOptions {
  endpoint: string;
  enabled?: boolean;
}

// Define events your plugin emits:
interface MyPluginEvents {
  'dataFetched': { count: number };
  'fetchFailed': { reason: string };
}

export class MyPlugin extends Plugin<NMMusicPlayer, MyPluginOptions, MyPluginEvents> {
  static readonly id = 'my-vendor:my-plugin'; // vendored id — required
  static readonly version = '1.0.0';
  static readonly description = 'Fetches external data on track change';

  use() {
    // Wire listeners here. They auto-dispose on plugin dispose.
    this.on('current', ({ item }) => {
      this.fetchData(item);
    });
  }

  private async fetchData(item: ReturnType<NMMusicPlayer['current']>) {
    if (!item) return;
    try {
      const result = await this.fetch(
        `${this.opts.endpoint}?id=${item.id}`,
        (resp) => resp.json() as Promise<{ count: number }>,
      );
      this.emit('dataFetched', { count: result.count });
    } catch {
      this.emit('fetchFailed', { reason: 'network error' });
    }
  }

  dispose() {
    // Free anything not managed by the lifecycle helpers (this.on, this.timeout, etc.).
    // Listeners wired via this.on() auto-dispose — you don't need to clean those.
  }
}
```

---

## Identity (required)

Every plugin must declare these static fields. Lint enforces them.

```ts
static readonly id = 'vendor:name';        // MUST — vendored, kebab-case
static readonly version = '1.0.0';         // MUST — semver
static readonly description = 'One line'; // MUST — human-readable, appears in errors
static readonly minCoreVersion?: string;   // SHOULD — minimum kit version required
```

Id conventions:
- Kit-shipped plugins: bare name (`'lyrics'`, `'auto-advance'`)
- Third-party / consumer plugins: `vendor:name` (`'nomercy:sync'`, `'fillz:winamp'`)

---

## Lifecycle

```
constructor()                    // no args; do not access player or opts here
initialize(player, opts, lc)    // base class assigns fields; rarely override
use(): void | Promise<void>      // wire listeners, mount DOM, fetch resources
enable() / disable()             // runtime toggle; listeners stay subscribed
setOptions(partial)              // runtime options update
dispose()                        // explicit teardown for things lifecycle doesn't handle
```

`player.setup()` awaits all plugins' `use()` promises before emitting `ready`. A plugin whose `use()` rejects is marked failed (`enabled() === false`) but does not bring down the player.

---

## Lifecycle helpers (auto-dispose)

Use these instead of raw browser APIs. They auto-clean when the plugin is disposed.

```ts
// Listeners — auto-removed on dispose:
this.on('time', handler);
this.on(OtherPlugin, 'someEvent', handler);

// Timers:
this.timeout(fn, 1000);
this.interval(fn, 5000);
this.frame(fn);        // requestAnimationFrame loop

// DOM observers:
this.observe(element, 'resize', handler);
```

Direct `player.on(...)` outside `this.on(...)` is not auto-disposed. Always use `this.on(...)` inside plugins.

---

## State surface (required)

The base class provides default implementations. Override when you need custom behavior.

```ts
// Provided by base class, no code needed for default behavior:
plugin.enabled()          // boolean
plugin.enable()           // re-activate
plugin.disable()          // deactivate (listeners stay subscribed)
plugin.state()            // { id, enabled, opts, runtime }
plugin.setOptions(patch)  // runtime options update — emits 'opts:changed'
plugin.getOptions()       // current options (readonly)
```

If you have runtime state to expose via `state()`, override `protected getRuntimeState()`:

```ts
protected getRuntimeState() {
  return {
    lastFetchedId: this.lastFetchedId,
    fetchCount: this.fetchCount,
  };
}
```

---

## Emitting events

```ts
// Simple fire-and-forget (auto-namespaced to plugin:<id>:<name>):
this.emit('dataFetched', { count: 5 });

// Cancellable, mutable, async-aware:
const result = await this.dispatchBefore('beforeFetch', { url });
if (result.prevented) return;
const actualUrl = result.data.url; // possibly mutated by a listener
```

Export your event map type alongside the class so consumers get type inference:

```ts
export type { MyPluginEvents };
export class MyPlugin extends Plugin<...NMMusicPlayer, MyPluginOptions, MyPluginEvents> { ... }
```

---

## Listening to events

Two typed forms — both auto-disposed. No untyped string fallback.

```ts
// Player / core events:
this.on('time', ({ time }) => { /* typed */ });
this.on('current', ({ item, index }) => { /* typed */ });

// Cross-plugin events — typed via imported class:
this.on(EqualizerPlugin, 'bandChanged', (event) => {
  // event.data is typed from EqualizerPlugin's event map
});
```

---

## Declaring plugin dependencies

```ts
import { AudioGraphPlugin } from '@nomercy-entertainment/nomercy-music-player';

export class MyVisualizerPlugin extends Plugin<...> {
  static readonly requires = [AudioGraphPlugin]; // required — player enforces this at registration
}

// Object form for optional or version-pinned deps:
static readonly requires = [
  AudioGraphPlugin,
  { plugin: EqualizerPlugin, optional: true },
  { plugin: LyricsPlugin, minVersion: '2.1.0' },
];
```

The player checks `requires` at `addPlugin()`. A missing required dep throws immediately. An optional missing dep logs in debug mode but the plugin runs.

Once declared, access the dep from the plugin body:

```ts
use() {
  const graph = this.player.getPlugin(AudioGraphPlugin);
  // graph is typed as AudioGraphPlugin — no cast
}
```

---

## Plugin-to-plugin event communication

Plugins only communicate through the event system. Never import and call another plugin's methods directly.

```ts
// Correct — typed event subscription:
this.on(LyricsPlugin, 'cueChange', ({ line }) => {
  this.displayLine(line);
});

// Wrong — direct method call across plugin boundary:
this.player.getPlugin(LyricsPlugin).doSomethingInternal(); // don't do this
```

---

## Error handling

Never throw raw errors inside plugin code. Use the error surface the base class provides.

```ts
// Fatal — plugin fails, marks itself disabled. Player survives.
this.throw({ severity: 'fatal', code: 'my-plugin/connection-lost', message: 'WebSocket closed' });

// Non-fatal — operation fails, plugin keeps running. Caller flow aborts.
this.throw({ severity: 'error', code: 'my-plugin/fetch-failed', message: 'API returned 500' });

// Degradation — plugin survives, caller continues.
this.report({ severity: 'warning', code: 'my-plugin/rate-limited', message: 'Throttled' });

// Observability only:
this.report({ severity: 'info', code: 'my-plugin/cache-hit', message: 'Served from cache' });
```

---

## Plugin options

Options are passed at registration:

```ts
player.addPlugin(MyPlugin, {
  endpoint: 'https://api.example.com/scrobble',
  enabled: true,
});
```

Runtime update:

```ts
player.getPlugin(MyPlugin).setOptions({ endpoint: 'https://new-endpoint.com' });
```

Override `setOptions` if you need to react to specific option changes:

```ts
setOptions(patch: Partial<MyPluginOptions>) {
  super.setOptions(patch); // apply + emit opts:changed
  if ('endpoint' in patch) {
    this.reconnect(); // react to endpoint change
  }
}
```

---

## Replacing a built-in plugin

To override a built-in plugin, declare the same `id` and add `static readonly replaces`:

```ts
class CapacitorMediaSession extends Plugin<...> {
  static readonly id = 'media-session';
  static readonly replaces = 'media-session'; // disposes the existing one, registers this
}

player.addPlugin(CapacitorMediaSession);
```

---

## Testing plugins

Use the `describePlugin` helper from the kit's testing module:

```ts
import { describePlugin, assertNoListenerLeak } from '@nomercy-entertainment/nomercy-player-core/testing';
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { MyPlugin } from './my-plugin';

describePlugin(MyPlugin, ({ player, plugin }) => {
  test('emits dataFetched on current track change', async () => {
    const events: unknown[] = [];
    player.on(MyPlugin, 'dataFetched', (e) => events.push(e));
    player.current({ id: '1', name: 'Track', url: '...' });
    await vi.waitFor(() => events.length > 0);
    expect(events[0]).toEqual({ count: expect.any(Number) });
  });
});

test('no listener leak', () => {
  const player = nmMPlayer('test').setup({});
  assertNoListenerLeak(player, MyPlugin);
});
```

`describePlugin` provides a fresh player + registered plugin per test with auto-dispose in `afterEach`.

---

## Conformance checklist

Before shipping a plugin:

- `static readonly id` is vendored (`vendor:name` for consumer plugins)
- `static readonly version` is a semver string
- `static readonly description` is a one-liner
- `use()` and `dispose()` are defined or inherited
- All listeners use `this.on` (not raw `player.on`)
- All timers use `this.timeout` / `this.interval` / `this.frame`
- All errors use `this.throw` or `this.report` (no raw `throw`)
- Every public mutator has a paired reader
- Plugin's `E` generic is declared and the event-map type is exported
- `static requires` declared if depending on other plugins
- Tests via `describePlugin` cover behavior + `assertNoListenerLeak`
