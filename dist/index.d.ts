import MediaSession from '@nomercy-entertainment/media-session';
import Queue from './queue';
import { PlayerOptions, type BasePlaylistItem, TimeState } from './types';
export declare class PlayerCore<S extends BasePlaylistItem> extends Queue<S> {
    mediaSession: MediaSession;
    constructor(config: PlayerOptions);
    dispose(): void;
    play(): Promise<void>;
    pause(): void;
    togglePlayback(): void;
    stop(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    mute(): void;
    unmute(): void;
    toggleMute(): void;
    seek(time: number): void;
    getDuration(): number;
    getCurrentTime(): number;
    getBuffer(): number;
    getTimeData(): TimeState;
    protected _initializeCore(): void;
    private handleReady;
    private handlePlay;
    private handlePause;
    private handleCurrentSongChange;
    private handleTimeUpdate;
    private handleError;
}
export default PlayerCore;
