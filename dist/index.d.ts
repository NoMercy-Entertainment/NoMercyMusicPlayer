import MediaSession from '@nomercy-entertainment/media-session';
import Queue from './queue';
import { PlayerOptions, type BasePlaylistItem, TimeState } from './types';
export declare class PlayerCore<S extends BasePlaylistItem> extends Queue<S> {
    mediaSession: MediaSession;
    actions?: {
        play?: MediaSessionActionHandler;
        pause?: MediaSessionActionHandler;
        stop?: MediaSessionActionHandler;
        previous?: MediaSessionActionHandler;
        next?: MediaSessionActionHandler;
        seek?: (number: number) => void;
    };
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
    setAutoPlayback(value: boolean): void;
    protected _initializeCore(): void;
    private handleReady;
    private handlePlay;
    private handlePause;
    private handleCurrentSongChange;
    private handleTimeUpdate;
    private handleError;
}
export default PlayerCore;
