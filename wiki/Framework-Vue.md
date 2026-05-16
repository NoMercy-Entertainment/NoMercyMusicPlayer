# Vue Integration

Using `nomercy-music-player` with Vue 3 (Composition API).

---

## Install

```
npm install @nomercy-entertainment/nomercy-music-player
```

---

## Basic composable

Wrap the player in a composable so it lives outside the Vue component tree and survives navigation:

```ts
// composables/useMusicPlayer.ts
import { ref, shallowRef, onUnmounted } from 'vue';
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { AutoAdvancePlugin, MediaSessionPlugin } from '@nomercy-entertainment/nomercy-music-player';

const player = shallowRef(
  nmMPlayer('main').setup({
    queue: [],
  })
);

// Register plugins once — not inside the component
player.value
  .addPlugin(AutoAdvancePlugin)
  .addPlugin(MediaSessionPlugin);

export function useMusicPlayer() {
  const currentTrack = shallowRef(player.value.current());
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(player.value.volume());

  function setup() {
    player.value.on('current', ({ item }) => {
      currentTrack.value = item;
    });
    player.value.on('play', () => { isPlaying.value = true; });
    player.value.on('pause', () => { isPlaying.value = false; });
    player.value.on('ended', () => { isPlaying.value = false; });
    player.value.on('time', ({ time }) => { currentTime.value = time; });
    player.value.on('duration', ({ duration: dur }) => { duration.value = dur; });
    player.value.on('volume', ({ level }) => { volume.value = level; });
  }

  setup();

  return {
    player: player.value,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
  };
}
```

---

## Player component

```vue
<!-- components/MusicPlayer.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useMusicPlayer } from '@/composables/useMusicPlayer';

const { player, currentTrack, isPlaying, currentTime, duration, volume } = useMusicPlayer();

const progress = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
);

function seek(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement;
  const ratio = event.offsetX / bar.clientWidth;
  player.currentTime(ratio * duration.value);
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<template>
  <div class="music-player">
    <div class="track-info" v-if="currentTrack">
      <img :src="currentTrack.cover" v-if="currentTrack.cover" />
      <div>
        <p>{{ currentTrack.name }}</p>
      </div>
    </div>

    <div class="controls">
      <button @click="player.previous()">Prev</button>
      <button @click="isPlaying ? player.pause() : player.play()">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button @click="player.next()">Next</button>
    </div>

    <div class="progress" @click="seek">
      <div class="bar" :style="{ width: progress + '%' }" />
    </div>

    <div class="time">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </div>

    <div class="volume">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="volume"
        @input="player.volume(Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </div>
</template>
```

---

## Loading a queue

```ts
const { player } = useMusicPlayer();

// From an API response — map `path` → `url` if your server uses the v1 field name:
const tracks = await fetch('/api/tracks').then(r => r.json());
player.queue(tracks.map((t: any) => ({ ...t, url: t.url ?? t.path })));
await player.play();
```

---

## Using plugins from a component

```ts
import { EqualizerPlugin } from '@nomercy-entertainment/nomercy-music-player';

const { player } = useMusicPlayer();
const eq = player.getPlugin(EqualizerPlugin);

function setBand(index: number, gain: number) {
  eq?.setBand(index, gain);
}
```

---

## Cleanup

The player instance is designed to live for the application lifetime (like a Pinia store). If you need to tear it down on component unmount, call `player.dispose()` inside `onUnmounted`. In most apps you do not need to do this.

```ts
onUnmounted(() => {
  player.dispose();
});
```

---

## shallowRef vs ref

Always use `shallowRef` for the player instance. `ref` deep-wraps the object in a Vue `Proxy`, which adds overhead and can interfere with the player's internal identity checks. The player class is not designed to be reactive — wrap its observable state (current track, time, etc.) in `ref` separately, as shown in the composable above.
