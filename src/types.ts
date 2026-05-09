import type { BaseEventMap, BasePlayerConfig, BasePlaylistItem } from '@nomercy-entertainment/nomercy-player-core';
import type { IAudioBackend } from './player/audio-backend/backend';

export interface ArtistRef {
	id: string | number;
	name: string;
}

export interface AlbumRef {
	id: string | number;
	name: string;
}

/**
 * Default music playlist item shape. Consumers extend with their own
 * fields via the generic on `nmMPlayer<T>('id')`.
 */
export interface MusicPlaylistItem extends BasePlaylistItem {
	name: string;
	cover?: string;
	artist_track?: ArtistRef[];
	album_track?: AlbumRef[];
	url?: string;
	lyricsUrl?: string;
	duration?: number;
}

/** Volume gain stage. Returned by `player.volumeState()`. */
export enum VolumeState {
	UNMUTED = 'unmuted',
	MUTED = 'muted',
}

/** Top-level playback state. Returned by `player.playState()`. */
export enum PlayState {
	IDLE = 'idle',
	LOADING = 'loading',
	PLAYING = 'playing',
	PAUSED = 'paused',
	STOPPED = 'stopped',
	ERROR = 'error',
}

/** Repeat mode. Returned by `player.repeatState()`. */
export enum RepeatState {
	OFF = 'off',
	ALL = 'all',
	ONE = 'one',
}

/** Shuffle mode. Returned by `player.shuffleState()`. */
export enum ShuffleState {
	OFF = 'off',
	ON = 'on',
}

/** Quality / bitrate selection mode. Returned by `player.qualityState()`. */
export enum QualityState {
	AUTO = 'auto',
	MANUAL = 'manual',
}

/** Audio track selection mode. Returned by `player.audioTrackState()`. */
export enum AudioTrackState {
	DEFAULT = 'default',
	MANUAL = 'manual',
}

/** Aggregated time state — re-exported from the kit. */
export type { TimeState } from '@nomercy-entertainment/nomercy-player-core';

/**
 * Music-specific events on top of `BaseEventMap`.
 *
 * Cursor change is signalled by `BaseEventMap.current` — listen to that for
 * "current track changed". Music adds events for repeat / shuffle / mute /
 * crossfade / EQ that don't apply to other player libraries.
 */
export interface MusicEventMap extends BaseEventMap {
	'mute': { muted: boolean };
	'volume': { level: number };
	'repeat': { state: RepeatState };
	'shuffle': { state: ShuffleState };
	'trackEndingSoon': { remaining: number; currentTrack: BasePlaylistItem };
	'crossfadeStart': { from: BasePlaylistItem; to: BasePlaylistItem; duration: number };
	'crossfadeComplete': { track: BasePlaylistItem };
	'eq:change': { band: number; gain: number };
}

export interface CrossfadeOptions {
	duration: number;
	curve?: 'linear' | 'equal-power';
}

/** Backend selection at setup time. */
export type AudioBackendKind = 'audio-element' | 'webaudio';

/**
 * Custom backend factory. Receives the resolved backend kind and the player
 * options; returns an `IAudioBackend` impl. Use this to inject WebCodecs,
 * native-shell bridges (Capacitor `<audio>`), or experimental backends without
 * subclassing the player.
 */
export type AudioBackendFactory = (
	kind: AudioBackendKind,
	config: MusicPlayerConfig<BasePlaylistItem>,
) => IAudioBackend;

/** Music player configuration. */
export interface MusicPlayerConfig<T extends BasePlaylistItem = MusicPlaylistItem> extends BasePlayerConfig {
	backend?: AudioBackendKind;
	/**
	 * Custom backend factory. When supplied, overrides the kit's default
	 * `audio-element` / `webaudio` resolution. Receives the resolved kind so
	 * factories can branch on it (or ignore it and return a single impl).
	 */
	backendFactory?: AudioBackendFactory;
	/** Default crossfade applied to every `crossfadeTo` unless overridden per-call. */
	crossfadeDefaults?: { duration: number; curve?: 'linear' | 'equal-power' };
	/** Initial playlist — items inline, or a URL fetched and parsed at setup. */
	playlist?: T[] | string;
}
