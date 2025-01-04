import PlayerCore from "./index";
import { ConstructorOptions } from "audiomotion-analyzer";
export interface PlayerOptions {
    baseUrl?: string;
    motionConfig?: ConstructorOptions;
    motionColors?: string[];
}
export interface AudioOptions {
    id: number;
    volume?: number;
    prefetchLeeway?: number;
    fadeDuration?: number;
    bands: EQBand[];
    motionColors: string[];
    motionConfig: ConstructorOptions;
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
        [key: string]: any;
    }[];
    artist_track: {
        name: string;
        [key: string]: any;
    }[];
    origin: string;
    [key: string]: any;
}
