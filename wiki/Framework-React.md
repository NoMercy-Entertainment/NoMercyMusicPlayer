# React Integration

Using `nomercy-music-player` with React 18+ (hooks).

---

## Install

```
npm install @nomercy-entertainment/nomercy-music-player
```

---

## Player singleton

Create the player outside the React component tree so it is not re-created on renders:

```ts
// lib/musicPlayer.ts
import { nmMPlayer } from '@nomercy-entertainment/nomercy-music-player';
import { AutoAdvancePlugin, MediaSessionPlugin } from '@nomercy-entertainment/nomercy-music-player';

export const player = nmMPlayer('main').setup({ queue: [] });

player
  .addPlugin(AutoAdvancePlugin)
  .addPlugin(MediaSessionPlugin);
```

---

## Custom hook

```ts
// hooks/useMusicPlayer.ts
import { useState, useEffect } from 'react';
import { player } from '@/lib/musicPlayer';
import type { MusicPlaylistItem } from '@nomercy-entertainment/nomercy-music-player';

export function useMusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<MusicPlaylistItem | undefined>(
    player.current(),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(player.volume());

  useEffect(() => {
    player.on('current', ({ item }) => setCurrentTrack(item));
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('ended', () => setIsPlaying(false));
    player.on('time', ({ time }) => setCurrentTime(time));
    player.on('duration', ({ duration: dur }) => setDuration(dur));
    player.on('volume', ({ level }) => setVolume(level));

    return () => {
      // Player outlives the component — don't dispose here.
      // If you need per-component cleanup, use player.off() with the exact handler refs.
    };
  }, []);

  return { currentTrack, isPlaying, currentTime, duration, volume };
}
```

---

## Player component

```tsx
// components/MusicPlayer.tsx
import React from 'react';
import { player } from '@/lib/musicPlayer';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function MusicPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, volume } = useMusicPlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const bar = e.currentTarget;
    const ratio = e.nativeEvent.offsetX / bar.clientWidth;
    player.currentTime(ratio * duration);
  }

  return (
    <div className="music-player">
      {currentTrack && (
        <div className="track-info">
          {currentTrack.cover && <img src={currentTrack.cover} alt="" />}
          <p>{currentTrack.name}</p>
        </div>
      )}

      <div className="controls">
        <button onClick={() => player.previous()}>Prev</button>
        <button onClick={() => (isPlaying ? player.pause() : player.play())}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => player.next()}>Next</button>
      </div>

      <div className="progress" onClick={handleSeek} style={{ cursor: 'pointer' }}>
        <div className="bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="time">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => player.volume(Number(e.target.value))}
      />
    </div>
  );
}
```

---

## Loading a queue

```ts
import { player } from '@/lib/musicPlayer';

async function loadAlbum(albumId: string) {
  const tracks = await fetch(`/api/albums/${albumId}/tracks`).then(r => r.json());
  // Map server field names if your API uses v1 'path' naming:
  player.queue(tracks.map((t: any) => ({ ...t, url: t.url ?? t.path })));
  await player.play();
}
```

---

## Strict Mode

React Strict Mode double-invokes effects in development. This is safe: the player is created outside React and is a singleton. The `useEffect` in `useMusicPlayer` only registers listeners — double-invocation registers them twice. Add explicit cleanup to prevent this:

```ts
useEffect(() => {
  const handleCurrent = ({ item }: { item: MusicPlaylistItem | undefined }) =>
    setCurrentTrack(item);

  player.on('current', handleCurrent);

  return () => {
    player.off('current', handleCurrent);
  };
}, []);
```

Repeat for each event you subscribe to.

---

## useSyncExternalStore (React 18+)

For more fine-grained subscription control, use `useSyncExternalStore`:

```ts
import { useSyncExternalStore } from 'react';
import { player } from '@/lib/musicPlayer';

function useCurrentTime() {
  return useSyncExternalStore(
    (callback) => {
      player.on('time', callback as any);
      return () => player.off('time', callback as any);
    },
    () => player.currentTime(),
    () => 0, // server snapshot
  );
}
```
