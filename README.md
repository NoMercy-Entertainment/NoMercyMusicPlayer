  \####################################################  
 \#    This repository is under development and will break.      #  
\####################################################

# NoMercy MusicPlayer

**NoMercy MusicPlayer** is a lightweight HTML5 audio player built with JavaScript.

## Features

- **HTML5 Audio Support**: Compatible with popular media formats (MP3, FLAC, OGG).
- **Event-Driven**: Full event-driven API.
- **Queue system**: Add songs to a queue and play them in order.
- **Equalizer**: Built-in equalizer.

## Installation
```sh
npm install @nomercy-entertainment/music-player

yarn add @nomercy-entertainment/music-player

pnpm add @nomercy-entertainment/music-player
```

## Usage
```typescript
import { ref } from 'vue';
import { MusicPlayer } from '@nomercy-entertainment/music-player';

export const isPlaying = ref<boolean>(false);

const musicPlayer = new MusicPlayer();

musicPlayer.setBaseUrl('https://example.com/music');
musicPlayer.setAccessToken('...'); // Optional

musicPlayer.setQueue([
    {
        id: 'song1',
        title: 'Song 1',
        artist_track: [{
            name: 'Artist 1'
        }],
        album_track: [{
            name: 'Album 1'
        }],
        cover: '/cover1.jpg',
        file: '/song1.mp3'
    },
    {
        id: 'song2',
        title: 'Song 2',
        artist_track: [{
            name: 'Artist 2'
        }],
        album_track: [{
            name: 'Album 2'
        }],
        cover: '/cover2.jpg',
        file: '/song2.mp3'
    }
]);

musicPlayer.on('play', () => {
	isPlaying.value = true;
});
musicPlayer.on('pause', () => {
	isPlaying.value = false;
});
musicPlayer.on('stop', () => {
	isPlaying.value = false;
});

export {
    musicPlayer,
    isPlaying
};
```

```vue
<script setup lang="ts">
import {MoooomIcon} from '@nomercyicons/vue';
import audioPlayer, {isPlaying} from '@/store/audioPlayer';

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    audioPlayer.value?.togglePlayback();
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
MIT

## Contact

For further information or support, visit NoMercy.tv or contact our support team.

Made with ❤️ by [NoMercy Entertainment](https://nomercy.tv)
