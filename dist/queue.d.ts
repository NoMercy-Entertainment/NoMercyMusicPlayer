import Helpers from './helpers';
import type { IsShuffling, RepeatState, BasePlaylistItem } from './types';
export default class Queue<S extends BasePlaylistItem> extends Helpers<S> {
    currentSong: S | null;
    protected _repeat: RepeatState;
    protected _queue: Array<S>;
    protected _backLog: Array<S>;
    protected _shuffle: IsShuffling;
    constructor();
    getQueue(): Array<S>;
    setQueue(payload: Array<S>): void;
    addToQueue(payload: S): void;
    pushToQueue(payload: S[]): void;
    removeFromQueue(payload: S): void;
    addToQueueNext(payload: S): void;
    getBackLog(): Array<S>;
    setBackLog(payload: Array<S>): void;
    addToBackLog(payload: S | null): void;
    pushToBackLog(payload: S[]): void;
    removeFromBackLog(payload: S): void;
    setCurrentSong(payload: S | null): void;
    next(): void;
    previous(): void;
    playTrack(track: S, tracks?: S[]): void;
    shuffle(value: IsShuffling): void;
    repeat(value: RepeatState): void;
    protected _initializeQueue(): void;
}
