import PlayerCore from "./index";
export interface PlayerOptions {
}
export interface AudioOptions {
    id: number;
    volume?: number;
    prefetchLeeway?: number;
    fadeDuration?: number;
    bands: EQBand[];
}
export interface TimeState {
    buffered: number;
    duration: any;
    percentage: number;
    position: any;
    remaining: number;
}
export type RepeatState = 'off' | 'one' | 'all';
export type Time = number;
export type Volume = number;
export type Item = Song;
export type IsPlaying = boolean;
export type IsMuted = boolean;
export type IsShuffling = boolean;
export type IsRepeating = boolean;
export interface EQSliderValues {
    pan: {
        min: number;
        max: number;
        step: number;
        default: number;
    };
    pre: {
        min: number;
        max: number;
        step: number;
        default: number;
    };
    band: {
        min: number;
        max: number;
        step: number;
        default: number;
    };
}
export interface EQBand {
    frequency: number | 'Pre';
    gain: number;
}
export interface EqualizerPreset {
    name: string;
    values: {
        frequency: number;
        gain: number;
    }[];
}
declare global {
    interface Window {
        musicPlayer: PlayerCore<Song>;
    }
}
export interface Song {
    id: string;
    name: string;
    track: number;
    disc: number;
    folder: string;
    filename: string;
    path: string;
    album_track: {
        name: string;
    }[];
    artist_track: {
        name: string;
    }[];
    origin: string;
    [key: string]: any;
}
