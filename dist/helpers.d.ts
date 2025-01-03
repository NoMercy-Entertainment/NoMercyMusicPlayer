import AudioNode from './audioNode';
import type { EQBand, EQSliderValues, EqualizerPreset, IsMuted, IsPlaying, IsRepeating, IsShuffling, PlayerOptions, RepeatState, Song, Time, TimeState, Volume } from './types';
import { PlayerState, VolumeState } from "./state";
export default class Helpers<S extends Song> extends EventTarget {
    volume: Volume;
    muted: IsMuted;
    duration: Time;
    currentTime: Time;
    buffered: number;
    playbackRate: number;
    fadeDuration: number;
    currentSong: S | null;
    state: PlayerState;
    volumeState: VolumeState;
    isShuffling: IsShuffling;
    isRepeating: IsRepeating;
    isMuted: IsMuted;
    isPaused: boolean;
    isPlaying: IsPlaying;
    isStopped: boolean;
    isSeeking: boolean;
    isTransitioning: boolean;
    newSourceLoaded: boolean;
    serverLocation?: string;
    accessToken: string;
    protected _options: PlayerOptions;
    context: AudioContext | null;
    protected preGain: GainNode | null;
    protected filters: BiquadFilterNode[];
    protected panner: StereoPannerNode | null;
    protected siteTitle: string;
    equalizerPanning: number;
    equalizerSliderValues: EQSliderValues;
    equalizerBands: EQBand[];
    equalizerPresets: EqualizerPreset[];
    _audioElement1: AudioNode<S>;
    _audioElement2: AudioNode<S>;
    _currentAudio: AudioNode<S>;
    protected _nextAudio: AudioNode<S>;
    constructor();
    setAccessToken(accessToken: string): void;
    setServerLocation(serverLocation?: string): void;
    getNewSource(newItem: S | null): Promise<string>;
    loadEqualizerSettings(): void;
    setPreGain(gain: number): void;
    setPanner(pan: number): void;
    setFilter(filter: EQBand): void;
    saveEqualizerSettings(): void;
    protected setTitle(arg?: string | null): void;
    /**
     * Trigger an event on the player.
     * @param event type of event to trigger
     * @param data  data to pass with the event
     */
    emit(event: 'duration', data: number): void;
    emit(event: 'loadstart', source: HTMLAudioElement): void;
    emit(event: 'loadedmetadata', source: HTMLAudioElement): void;
    emit(event: 'canplay', source: HTMLAudioElement): void;
    emit(event: 'waiting', source: HTMLAudioElement): void;
    emit(event: 'error', source: HTMLAudioElement): void;
    emit(event: 'ended', source: HTMLAudioElement): void;
    emit(event: 'pause', source: HTMLAudioElement): void;
    emit(event: 'play', source: HTMLAudioElement): void;
    emit(event: 'stop'): void;
    emit(event: 'pause-internal', source: HTMLAudioElement): void;
    emit(event: 'play-internal', source: HTMLAudioElement): void;
    emit(event: 'queueNext'): void;
    emit(event: 'startFadeOut'): void;
    emit(event: 'endFadeOut'): void;
    emit(event: 'nextSong'): void;
    emit(event: 'ready'): void;
    emit(event: 'song', data: S | null): void;
    emit(event: 'backlog', data: S[]): void;
    emit(event: 'queue', data: S[]): void;
    emit(event: 'shuffle', data: IsShuffling): void;
    emit(event: 'mute', data: IsMuted): void;
    emit(event: 'repeat', data: RepeatState): void;
    emit(event: 'seeked', data: TimeState): void;
    emit(event: 'setCurrentAudio', data: HTMLAudioElement): void;
    emit(event: 'time', data: TimeState): void;
    emit(event: 'time-internal', data: TimeState): void;
    emit(event: 'volume', data: Volume): void;
    emit(event: 'setPreGain', data: number): void;
    emit(event: 'setPanner', data: number): void;
    emit(event: 'setFilter', data: EQBand): void;
    /**
     * Adds an event listener to the player.
     * @param event - The event to listen for.
     * @param callback - The function to execute when the event occurs.
     */
    on(event: 'duration', callback: (data: Time) => void): void;
    on(event: 'loadstart', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'loadedmetadata', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'canplay', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'waiting', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'error', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'ended', callback: (element: HTMLAudioElement) => void): void;
    on(event: 'pause', callback: () => void): void;
    on(event: 'play', callback: () => void): void;
    on(event: 'stop', callback: () => void): void;
    on(event: 'pause-internal', callback: () => void): void;
    on(event: 'play-internal', callback: () => void): void;
    on(event: 'queueNext', callback: () => void): void;
    on(event: 'startFadeOut', callback: () => void): void;
    on(event: 'endFadeOut', callback: () => void): void;
    on(event: 'nextSong', callback: () => void): void;
    on(event: 'ready', callback: () => void): void;
    on(event: 'song', callback: (data: S | null) => void): void;
    on(event: 'backlog', callback: (data: S[]) => void): void;
    on(event: 'queue', callback: (data: S[]) => void): void;
    on(event: 'shuffle', callback: (data: IsShuffling) => void): void;
    on(event: 'mute', callback: (data: IsMuted) => void): void;
    on(event: 'repeat', callback: (data: RepeatState) => void): void;
    on(event: 'seeked', callback: (data: TimeState) => void): void;
    on(event: 'setCurrentAudio', callback: () => void): void;
    on(event: 'time', callback: (data: TimeState) => void): void;
    on(event: 'time-internal', callback: (data: TimeState) => void): void;
    on(event: 'volume', callback: (data: Volume) => void): void;
    on(event: 'setPreGain', callback: (data: number) => void): void;
    on(event: 'setPanner', callback: (data: number) => void): void;
    on(event: 'setFilter', callback: (data: EQBand) => void): void;
    /**
     * Removes an event listener from the player.
     * @param event - The event to remove.
     * @param callback - The function to remove.
     */
    off(event: 'duration', callback: (data: Time) => void): void;
    off(event: 'loadstart', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'loadedmetadata', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'canplay', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'waiting', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'error', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'ended', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'pause', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'play', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'stop', callback: () => void): void;
    off(event: 'pause-internal', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'play-internal', callback: (source: HTMLAudioElement) => void): void;
    off(event: 'queueNext', callback: () => void): void;
    off(event: 'startFadeOut', callback: () => void): void;
    off(event: 'endFadeOut', callback: () => void): void;
    off(event: 'nextSong', callback: () => void): void;
    off(event: 'ready', callback: () => void): void;
    off(event: 'song', callback: (data: S | null) => void): void;
    off(event: 'backlog', callback: (data: S[]) => void): void;
    off(event: 'queue', callback: (data: S[]) => void): void;
    off(event: 'shuffle', callback: (data: IsShuffling) => void): void;
    off(event: 'mute', callback: (data: IsMuted) => void): void;
    off(event: 'repeat', callback: (data: RepeatState) => void): void;
    off(event: 'seeked', callback: (data: TimeState) => void): void;
    off(event: 'setCurrentAudio', callback: (data: HTMLAudioElement) => void): void;
    off(event: 'time', callback: (data: TimeState) => void): void;
    off(event: 'time-internal', callback: (data: TimeState) => void): void;
    off(event: 'volume', callback: (data: Volume) => void): void;
    off(event: 'setPreGain', callback: (data: number) => void): void;
    off(event: 'setPanner', callback: (data: number) => void): void;
    off(event: 'setFilter', callback: (data: EQBand) => void): void;
    /**
     * Adds an event listener to the player that will only be called once.
     * @param event - The event to listen for.
     * @param callback - The function to execute when the event occurs.
     */
    once(event: 'duration', callback: (data: Time) => void): void;
    once(event: 'loadstart', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'loadedmetadata', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'canplay', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'waiting', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'error', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'ended', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'pause', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'play', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'pause-internal', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'play-internal', callback: (source: HTMLAudioElement) => void): void;
    once(event: 'queueNext', callback: () => void): void;
    once(event: 'startFadeOut', callback: () => void): void;
    once(event: 'endFadeOut', callback: () => void): void;
    once(event: 'nextSong', callback: () => void): void;
    once(event: 'ready', callback: () => void): void;
    once(event: 'song', callback: (data: S | null) => void): void;
    once(event: 'backlog', callback: (data: S[]) => void): void;
    once(event: 'queue', callback: (data: S[]) => void): void;
    once(event: 'shuffle', callback: (data: IsShuffling) => void): void;
    once(event: 'mute', callback: (data: IsMuted) => void): void;
    once(event: 'repeat', callback: (data: RepeatState) => void): void;
    once(event: 'seeked', callback: (data: TimeState) => void): void;
    once(event: 'setCurrentAudio', callback: (data: HTMLAudioElement) => void): void;
    once(event: 'time', callback: (data: TimeState) => void): void;
    once(event: 'time-internal', callback: (data: TimeState) => void): void;
    once(event: 'volume', callback: (data: Volume) => void): void;
    once(event: 'setPreGain', callback: (data: number) => void): void;
    once(event: 'setPanner', callback: (data: number) => void): void;
    once(event: 'setFilter', callback: (data: EQBand) => void): void;
}
