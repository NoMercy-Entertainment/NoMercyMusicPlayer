import { ConstructorOptions } from "audiomotion-analyzer";
import PlayerCore from "./index";
export interface PlayerOptions {
    baseUrl?: string;
    siteTitle: string;
    motionConfig?: ConstructorOptions;
    motionColors?: string[];
    expose: boolean;
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
        musicPlayer: PlayerCore<BasePlaylistItem>;
    }
}
export interface BasePlaylistItem {
    name: string;
    path: string;
    album_track: {
        name: string;
        [key: string]: any;
    }[];
    artist_track: {
        name: string;
        [key: string]: any;
    }[];
    [key: string]: any;
}
