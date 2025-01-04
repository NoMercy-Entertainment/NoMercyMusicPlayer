﻿# NoMercy MusicPlayer

**NoMercy MusicPlayer** is a headless HTML5 audio player with a queue system and equalizer. </br>
It is framework-agnostic and can be used with any JavaScript framework.

## Features

- **HTML5 Audio Support**: Compatible with popular media formats (MP3, FLAC, OGG).
- **Framework Agnostic**: Works with any JavaScript framework.
- **No Ui**: No UI components, you can build your own.
- **Event-Driven**: Full event-driven API.
- **Queue system**: Add songs to a queue and play them in order, or shuffle them.
- **Equalizer**: Built-in equalizer.
- **Spectrum Analyzer**: Built-in spectrum analyzer.

## Installation
```sh
npm install @nomercy-entertainment/music-player
// or
yarn add @nomercy-entertainment/music-player
// or
pnpm add @nomercy-entertainment/music-player
```

## Usage

#### You can use any method to globally store the player instance and the current state. 
 
Vue makes this very easy without the need for a state management library. </br>
You can create a config for the spectrum analyzer and pass it to the player instance [here](https://audiomotion.dev/demo/fluid.html)


Vue 3 example:
```typescript
// store/audioPlayer.ts

import { ref } from 'vue';
import { MusicPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { BasePlaylistItem } from '@nomercy-entertainment/nomercy-music-player/dist/types';

// (optional) Extend the BasePlaylistItem interface to include additional properties needed in your UI.
export inerface PlaylistItem extends BasePlaylistItem {
  id: string;
  cover: string | null;
  disc: number;
  track: number;
  duration: string;
  favorite: boolean;
  date: string;
  lyrics?: Lyric[] | null;
  color_palette: ColorPalettes;
  album_track: Album[];
  artist_track: Artist[];
}

export const currentTime = ref<number>(0);
export const duration = ref<number>(0);
export const remainingTime = ref<number>(0);
export const percentage = ref<number>(0);
export const currentSong = ref<PlaylistItem | null>(null);
export const currentPlaylist = ref<string | null>(null);
export const queue = ref<PlaylistItem[]>([]);
export const backlog = ref<PlaylistItem[]>([]);
export const isPlaying = ref<boolean>(false);
export const isMuted = ref<boolean>(false);
export const isShuffling = ref<boolean>(false);
export const isRepeating = ref<RepeatState>('off');
export const volume = ref<number>(0);

const musicPlayer = new MusicPlayer<PlaylistItem>({
	motionConfig: {
	  // generate a config for the motion plugin
	},
	motionColors: [
		'#ff0000',
		'#ffff00',
		'#00ff00',
		'#00ffff',
		'#0000ff',
		'#ff00ff',
		'#ff0000',
	],
    expose: true, // Expose the player instance to the window object.
});

musicPlayer.setBaseUrl('https://example.com/');
musicPlayer.setAccessToken('...');

// Example playlist
const playlist: Array<BasePlaylistItem> = [
  {
	name: "Playground",
	cover: "/images/music/31053942112-500.jpg",
	path: "/01HQ5FOLDERID/[Soundtracks]/[2021] Arcane League of Legends_ Soundtrack From the Animated Series/01 Playground [Bea Miller].mp3",
	artist_track: [
	  {
		name: "Bea Miller",
		cover: "/images/music/miller-bea-5a0c19bb4430a.jpg",
	  }
	],
	album_track: [
	  {
		name: "Arcane League of Legends: Soundtrack From the Animated Series",
		cover: "/images/music/31053942112-500.jpg",
	  }
	]
  },
  {
	name: "Enemy",
	cover: "/images/music/31053942112-500.jpg",
	path: "/01HQ5FOLDERID/[Soundtracks]/[2021] Arcane League of Legends_ Soundtrack From the Animated Series/05 Enemy [Imagine Dragons feat. JID].mp3",
	artist_track: [
	  {
		name: "Imagine Dragons",
		cover: "/images/music/imagine-dragons-508436b48edc6.jpg",
	  },
	  {
		name: "JID",
		cover: "/images/music/jid-65342b2648e1e.jpg",
	  }
	],
	album_track: [
	  {
		name: "Arcane League of Legends: Soundtrack From the Animated Series",
		cover: "/images/music/31053942112-500.jpg",
	  }
	]
  },
  {
	name: "Guns for Hire",
	cover: "/images/music/31053942112-500.jpg",
	path: "/01HQ5FOLDERID/[Soundtracks]/[2021] Arcane League of Legends_ Soundtrack From the Animated Series/06 Guns for Hire [Woodkid].mp3",
	artist_track: [
	  {
		name: "Woodkid",
		cover: "/images/music/woodkid-508a4fe8c129f.jpg",
	  }
	],
	album_track: [
	  {
		name: "Arcane League of Legends: Soundtrack From the Animated Series",
		cover: "/images/music/31053942112-500.jpg",
	  }
	]
  }
];

// Set the queue and play the first song
musicPlayer.setQueue(playlist);
musicPlayer.setCurrentSong(playlist[0]);
// or
musicPlayer.playTrack(playlist[0], playlist);

// Event listeners
musicPlayer.on('song', (data) => {
  currentSong.value = data;
});

musicPlayer.on('queue', (data) => {
  queue.value = toRaw(data);
});
musicPlayer.on('backlog', (data) => {
  backlog.value = toRaw(data);
});

musicPlayer.on('play', () => {
	isPlaying.value = true;
});
musicPlayer.on('pause', () => {
	isPlaying.value = false;
});
musicPlayer.on('stop', () => {
	isPlaying.value = false;
});
musicPlayer.on('volume', (value) => {
  volume.value = value;
});
musicPlayer.on('time', (timeState) => {
  currentTime.value = timeState.position;
  duration.value = timeState.duration;
  remainingTime.value = timeState.remaining;
  percentage.value = timeState.percentage;
});

musicPlayer.on('shuffle', (value) => {
  isShuffling.value = value;
});
musicPlayer.on('repeat', (value) => {
  isRepeating.value = value;
});


export {
    musicPlayer,
    backlog,
    currentPlaylist,
    currentSong,
    currentTime,
    duration,
    isMuted,
    isPlaying,
    isRepeating,
    isShuffling,
    percentage,
    queue,
    remainingTime,
    volume,
};
```

Create playback button:

```vue
// components/PlaybackButton.vue

<script setup lang="ts">
import {MoooomIcon} from '@nomercyicons/vue';
import {audioPlayer, isPlaying} from '@/store/audioPlayer';

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    audioPlayer.togglePlayback();
};

</script>

<template>
    <button aria-label="Toggle Playback" @click="handleClick($event)">
        <MoooomIcon icon="nmPause" v-if="isPlaying" className="size-9" />
        <MoooomIcon icon="nmPlay" v-else className="size-9" />
    </button>
</template>

```

## License
[Apache 2.0](./LICENSE)

## Contact

For further information or support, visit NoMercy.tv or contact our support team.

Made with ❤️ by [NoMercy Entertainment](https://nomercy.tv)
