import {
	AudioGraphPlugin,
	BufferState,
	composeMixins,
	EqualizerPlugin,
	EventEmitter,
	initPlayerCoreState,
	MediaFormatError,
	NetworkState,
	playerCoreMethods,
	resolvePlayerConstructor,
	VisibilityState,
} from '@nomercy-entertainment/nomercy-player-core';
import type {
	ActionOptions,
	AudioTrack,
	AuthConfig,
	BasePlaylistItem,
	CastState,
	Chapter,
	CueParser,
	DeviceCapabilities,
	IPlatform,
	IPlayer,
	TimeState as KitTimeState,
	LoadOptions,
	PlaybackMetrics,
	PlayerExperimental,
	PlayerPhase,
	Plugin,
	QualityLevel,
	ResolvedUrl,
	SetupState,
	StreamFactory,
	SubtitleTrack,
	Translations,

	UrlCategory,
	UrlResolver,
} from '@nomercy-entertainment/nomercy-player-core';
import type { IAudioBackend } from './player/audio-backend/backend';
import { AudioElementBackend } from './player/audio-backend/audioElementBackend';
import { WebAudioBackend } from './player/audio-backend/webAudioBackend';
import type {
	AudioBackendKind,
	CrossfadeOptions,
	MusicEventMap,
	MusicPlayerConfig,
	MusicPlaylistItem,

	PlayState,
	RepeatState,
	ShuffleState,
	VolumeState,
} from './types';
import {
	AudioTrackState,
	QualityState,
} from './types';
import {
	AutoAdvancePlugin,
	CastSenderPlugin,
	KeyHandlerPlugin,
	LyricsPlugin,
	MediaSessionPlugin,
	TabLeaderPlugin,
} from './plugins';

export type {
	AudioBackendKind,
	CrossfadeOptions,
	MusicEventMap,
	MusicPlayerConfig,
	MusicPlaylistItem,
	TimeState,
} from './types';
export {
	AudioTrackState,
	PlayState,
	QualityState,
	RepeatState,
	ShuffleState,
	VolumeState,
} from './types';

const _instances = new Map<string, NMMusicPlayer<any>>();

/**
 * Headless music player. Plugin-driven, event-driven, no UI in core.
 *
 * The shared player core (lifecycle, transport, queue, state, volume, time,
 * plugins, i18n, cue parsers, baseUrl, audioContext, experimental override
 * surface) is composed onto the prototype from `playerCoreMethods` exported by
 * `@nomercy-entertainment/nomercy-player-core` — the LOGIC lives there, not
 * here. NMMusicPlayer adds only:
 *
 *  - The per-library registry (own `_instances` Map)
 *  - The three-form factory constructor
 *  - Library-typed method declarations (so consumers see `PlayState`, not
 *    the kit's internal string token — the runtime impl comes from the mixin)
 *  - Music-specific stubs (backends, crossfade, audio output devices, etc.)
 */
export class NMMusicPlayer<T extends BasePlaylistItem = MusicPlaylistItem>
	extends EventEmitter<MusicEventMap>
	implements IPlayer<MusicEventMap> {
	readonly playerId: string = '';
	container: HTMLElement = <HTMLElement>{};

	get id(): string {
		return this.playerId;
	}

	declare options: MusicPlayerConfig<T>;

	// ── Type-only declarations for the methods composed in from the kit's
	// `playerCoreMethods`. The bodies live in the kit; these declarations let
	// consumers see the music-typed contract without runtime cost.

	declare setup: (config: MusicPlayerConfig<T>) => this;
	declare ready: () => Promise<void>;
	declare dispose: () => void;
	declare setupState: () => SetupState;
	declare phase: () => PlayerPhase;
	declare dispatching: () => ReadonlyArray<string>;

	declare baseUrl: {
		(): string | undefined;
		(url: string): void;
	};

	declare audioContext: () => AudioContext | undefined;
	declare experimental: PlayerExperimental;

	declare t: (key: string, vars?: Record<string, string>) => string;
	declare language: () => string;
	declare setLanguage: (lang: string) => Promise<void>;
	declare addTranslations: (bundle: Translations) => void;
	declare setTranslation: (lang: string, key: string, value: string) => void;
	declare removeTranslations: (prefix: string, lang?: string) => void;

	declare registerCueParser: (parser: CueParser, prepend?: boolean) => void;
	declare unregisterCueParser: (id: string) => void;

	declare play: (opts?: ActionOptions) => Promise<void>;
	declare pause: (opts?: ActionOptions) => Promise<void>;
	declare stop: (opts?: ActionOptions) => Promise<void>;
	declare togglePlayback: (opts?: ActionOptions) => Promise<void>;
	declare next: (opts?: ActionOptions) => Promise<void>;
	declare previous: (opts?: ActionOptions) => Promise<void>;
	declare rewind: (seconds?: number, opts?: ActionOptions) => Promise<void>;
	declare forward: (seconds?: number, opts?: ActionOptions) => Promise<void>;
	declare restart: (opts?: ActionOptions) => Promise<void>;

	declare currentTime: {
		(): number;
		(t: number, opts?: ActionOptions): Promise<void>;
	};

	declare duration: () => number;
	declare buffered: () => number;
	declare bufferedRanges: () => TimeRanges;
	declare seekable: () => TimeRanges;
	declare timeData: () => KitTimeState;
	declare playbackRate: {
		(): number;
		(rate: number): void;
	};

	declare playbackRates: () => number[];

	declare volume: {
		(): number;
		(v: number): void;
	};

	declare mute: () => void;
	declare unmute: () => void;
	declare toggleMute: () => void;
	declare volumeUp: (step?: number) => void;
	declare volumeDown: (step?: number) => void;

	declare playState: () => PlayState;
	declare volumeState: () => VolumeState;
	declare repeatState: {
		(): RepeatState;
		(state: RepeatState): void;
	};

	declare shuffleState: {
		(): ShuffleState;
		(state: ShuffleState | boolean): void;
	};

	declare queue: {
		(): ReadonlyArray<T>;
		(items: T[], opts?: ActionOptions): void;
	};

	declare queueAppend: (item: T | T[], opts?: ActionOptions) => void;
	declare queuePrepend: (item: T | T[], opts?: ActionOptions) => void;
	declare queueInsert: (item: T | T[], index: number, opts?: ActionOptions) => void;
	declare queueRemove: (id: string | number, opts?: ActionOptions) => void;
	declare queueRemoveAt: (index: number, opts?: ActionOptions) => void;
	declare queueMove: (from: number, to: number, opts?: ActionOptions) => void;
	declare queueClear: (opts?: ActionOptions) => void;
	declare queueShuffle: (opts?: ActionOptions) => void;
	declare queueSort: (compare: (a: T, b: T) => number, opts?: ActionOptions) => void;
	declare peekNext: () => T | undefined;
	declare peekPrevious: () => T | undefined;
	declare queueLength: () => number;
	declare queueIndexOf: (id: string | number) => number;

	declare current: () => T | undefined;
	declare currentIndex: () => number;
	declare setCurrent: (target: T | string | number, opts?: ActionOptions) => void;

	declare backlog: {
		(): ReadonlyArray<T>;
		(items: T[]): void;
	};

	declare backlogAppend: (item: T | T[]) => void;
	declare backlogRemove: (id: string | number) => void;
	declare backlogClear: () => void;

	declare addPlugin: <P extends Plugin>(PluginClass: new () => P, opts?: P['opts']) => this;
	declare getPlugin: <P extends Plugin>(PluginClass: new () => P) => P | undefined;
	declare getPluginById: (id: string) => Plugin | undefined;
	declare removePlugin: <P extends Plugin>(PluginClass: new () => P) => void;
	declare removePluginById: (id: string) => void;
	declare plugins: () => ReadonlyArray<Plugin>;
	declare enabledPlugins: () => ReadonlyArray<Plugin>;

	constructor(id?: string | number) {
		super();
		// Resolve FIRST so the existing-instance path doesn't waste state init.
		// Spec §AB: avoid re-initializing core state on a player that's already
		// fully constructed and possibly mid-pipeline.
		const resolved = resolvePlayerConstructor(id, _instances, 'NMMusicPlayer');
		if (resolved.kind === 'existing') {
			return resolved.instance as unknown as this;
		}

		initPlayerCoreState(this, { className: 'NMMusicPlayer' });
		(this as { playerId: string }).playerId = resolved.id;
		this.container = resolved.div;
		_instances.set(resolved.id, this);
	}

	/** Test-only: clear the registry. Not part of the public API. */
	static _resetRegistry(): void {
		_instances.clear();
	}

	// ── Stream registration ── composed in via `streamRegistrationMethods` mixin.
	declare registerStream: (factory: StreamFactory, prepend?: boolean) => this;
	declare unregisterStream: (id: string) => this;
	declare streams: () => ReadonlyArray<string>;
	declare getStreamFactory: (id: string) => StreamFactory | undefined;

	// ── Backend ──
	// Music keeps TWO audio backends to enable sample-accurate crossfade:
	// `_backend` is the primary (currently audible) instance; `_secondary` is
	// the lazily-mounted preload/crossfade target. `_isTransitioning` flips
	// during a crossfade ramp.
	private _backend?: IAudioBackend;
	private _secondary?: IAudioBackend;
	private _isTransitioning = false;
	backend(): IAudioBackend;
	backend(kind: AudioBackendKind): Promise<void>;
	backend(kind?: AudioBackendKind): IAudioBackend | Promise<void> {
		if (kind === undefined) {
			if (!this._backend) {
				this._backend = new AudioElementBackend(this.container);
			}
			return this._backend;
		}
		return Promise.resolve().then(() => {
			if (this._backend) {
				this._backend.dispose();
				this._backend = undefined;
			}
			if (this._secondary) {
				this._secondary.dispose();
				this._secondary = undefined;
			}
			if (kind === 'webaudio') {
				this._backend = new WebAudioBackend(this.container);
				this.emit('backend:changed' as any, { kind } as any);
				return;
			}
			this._backend = new AudioElementBackend(this.container);
			this.emit('backend:changed' as any, { kind } as any);
		});
	}

	/** Ensure the secondary backend exists. Lazy mount on first crossfade. */
	private _ensureSecondary(): IAudioBackend {
		if (!this._secondary) {
			this._secondary = new AudioElementBackend(this.container);
			// Secondary starts silent. Crossfade ramps it up while ramping
			// primary down.
			this._secondary.volume(0);
		}
		return this._secondary;
	}

	// ── Loading ── composed in via `loadingMethods` mixin.
	declare load: (item: T, opts?: LoadOptions) => Promise<void>;
	declare loadQueue: (url: string, parser?: (raw: string) => T[]) => Promise<void>;

	// ── Crossfade — dual-element implementation ──
	//
	// Spec §M / spec §3 example. Two `<audio>` elements ramp gain in opposite
	// directions over `opts.duration` seconds (default 5). Primary fades to 0
	// while secondary ramps from 0 to the player's current volume. At
	// completion the backends swap: secondary becomes primary, old primary
	// unloads + disposes, secondary's slot is freed for the next preload.
	//
	// Short-circuits:
	//   - `_isTransitioning === true` → ignore (no nested crossfade).
	//   - duration <= 0 → instant swap, no ramp.
	//   - track resolves to no URL → throws MediaFormatError.
	async crossfadeTo(track: T, opts?: CrossfadeOptions & ActionOptions): Promise<void> {
		if (this._isTransitioning)
			return; // idempotent guard

		const duration = (opts?.duration ?? this.options?.crossfadeDefaults?.duration ?? 5);
		const url = (track as { url?: string }).url;
		if (!url) {
			throw new MediaFormatError({
				code: 'core:media/missing-url',
				severity: 'error',
				scope: { kind: 'core' },
				message: 'crossfadeTo(track) requires `track.url` to be present.',
				context: { id: (track as { id?: string | number }).id },
			});
		}

		const primary = this.backend() as IAudioBackend;
		const fromTrack = this.current?.() ?? null;
		const targetVolume = primary.volume();

		// Pre-load on the secondary slot (or reuse if `slot: 'next'` already
		// preloaded the same URL — heuristic by URL match).
		const secondary = this._ensureSecondary();
		const alreadyLoaded = (secondary as unknown as { mediaElement?: () => HTMLMediaElement }).mediaElement?.()?.currentSrc === url;
		if (!alreadyLoaded) {
			await secondary.load(url, { preload: 'auto' });
		}
		secondary.volume(0);
		await secondary.play();

		this._isTransitioning = true;
		this.emit('crossfadeStart' as any, {
			from: fromTrack,
			to: track,
			duration,
		} as any);

		// Ramp via setInterval. 50 ms ticks for ~20 fps gain updates — adequate
		// for vocal-band crossfade, accurate enough to land on duration*1000 ms.
		await new Promise<void>((resolve) => {
			if (duration <= 0) {
				primary.volume(0);
				secondary.volume(targetVolume);
				resolve();
				return;
			}
			const tickMs = 50;
			const totalSteps = Math.max(1, Math.floor((duration * 1000) / tickMs));
			let step = 0;
			const tick = setInterval(() => {
				step += 1;
				const t = Math.min(1, step / totalSteps);
				primary.volume(targetVolume * (1 - t));
				secondary.volume(targetVolume * t);
				if (t >= 1) {
					clearInterval(tick);
					resolve();
				}
			}, tickMs);
		});

		// Swap: old primary unloads + disposes, secondary takes over.
		try {
			primary.dispose();
		}
		catch { /* defensive */ }
		this._backend = secondary;
		this._secondary = undefined;

		// Advance the cursor so `current()` reflects the new track. setCurrent
		// emits the `current` event, which downstream plugins (mediaSession,
		// lyrics, autoAdvance) listen to.
		this.setCurrent?.(track.id ?? track);

		this._isTransitioning = false;
		this.emit('crossfadeComplete' as any, { track } as any);
	}

	isTransitioning(): boolean {
		return this._isTransitioning;
	}

	// ── State enums (music-specific — unimplemented) ──
	private _qualityState: QualityState = QualityState.AUTO;
	qualityState(): QualityState;
	qualityState(target: number | 'auto'): void;
	qualityState(target?: number | 'auto'): QualityState | void {
		if (target === undefined)
			return this._qualityState;
		this._qualityState = target === 'auto' ? QualityState.AUTO : QualityState.MANUAL;
		// Delegate the actual variant switch to the backend.
		const b = this._backend as { setQuality?: (idx: number | 'auto') => void } | undefined;
		b?.setQuality?.(target);
		this.emit('qualityState' as any, { state: this._qualityState } as any);
	}

	private _audioTrackState: AudioTrackState = AudioTrackState.DEFAULT;
	audioTrackState(): AudioTrackState;
	audioTrackState(idx: number): void;
	audioTrackState(idx?: number): AudioTrackState | void {
		if (idx === undefined)
			return this._audioTrackState;
		this._audioTrackState = AudioTrackState.MANUAL;
		const b = this._backend as { setAudioTrack?: (idx: number) => void } | undefined;
		b?.setAudioTrack?.(idx);
		this.emit('audioTrackState' as any, { state: this._audioTrackState } as any);
	}

	bufferState(): BufferState {
		// Derive from backend state. Maps backend's 'idle/loading/seeking/stalled'
		// onto the BufferState enum.
		const backendState = (this._backend as { state?: () => string } | undefined)?.state?.();
		switch (backendState) {
			case 'loading': return BufferState.LOADING;
			case 'seeking': return BufferState.SEEKING;
			case 'stalled': return BufferState.STALLED;
			default: return BufferState.IDLE;
		}
	}

	networkState(): NetworkState {
		const platform = (this as any).platform?.() as IPlatform | undefined;
		const monitor = platform?.network;
		if (!monitor)
			return NetworkState.ONLINE;
		if (!monitor.isOnline())
			return NetworkState.OFFLINE;
		const downlink = monitor.downlinkMbps?.();
		if (typeof downlink === 'number' && downlink > 0 && downlink < 1.5)
			return NetworkState.SLOW;
		return NetworkState.ONLINE;
	}

	streamState(): string {
		// Active stream factory id, or 'idle' if no stream is loaded yet.
		const backend = this._backend as { state?: () => string } | undefined;
		if (!backend)
			return 'idle';
		return backend.state?.() ?? 'idle';
	}

	visibilityState(): VisibilityState {
		const platform = (this as any).platform?.() as IPlatform | undefined;
		const visible = platform?.visibility?.isVisible() ?? true;
		return visible ? VisibilityState.VISIBLE : VisibilityState.HIDDEN;
	}

	// ── Device capabilities ── composed in via `deviceMethods` mixin.
	declare isTv: () => boolean;
	declare isMobile: () => boolean;
	declare isDesktop: () => boolean;
	declare device: () => DeviceCapabilities;

	// ── MediaCapabilities + ABR ── composed in via `abrMethods` mixin.
	declare canPlay: (profile: { contentType: string; width?: number; height?: number; bitrate?: number; framerate?: number }) => Promise<MediaCapabilitiesDecodingInfo>;
	declare bandwidth: () => number;
	declare setBandwidthEstimator: (fn: () => number) => void;

	// ── Audio output device ── composed in via `audioOutputMethods` mixin.
	declare audioOutputs: () => Promise<MediaDeviceInfo[]>;
	declare selectAudioOutput: () => Promise<MediaDeviceInfo | null>;

	// ── Tracks / chapters / quality ── composed in via `mediaTracksMethods` mixin.
	declare subtitles: () => SubtitleTrack[];
	declare setSubtitle: (idx: number | null) => void;
	declare audioTracks: () => AudioTrack[];
	declare setAudioTrack: (idx: number) => void;
	declare qualityLevels: () => QualityLevel[];
	declare setQuality: (idx: number | 'auto') => void;
	declare chapters: () => Chapter[];
	declare seekToChapter: (idx: number, opts?: ActionOptions) => void;
	declare nextChapter: (opts?: ActionOptions) => void;
	declare previousChapter: (opts?: ActionOptions) => void;

	// ── Cast / handoff ── composed in via `castMethods` mixin.
	declare castState: () => CastState;
	declare transferTo: (target: 'cast' | 'airplay' | 'remote-playback') => Promise<void>;

	// ── Auth runtime mutation ── composed in via `authMethods` mixin.
	declare setAuth: (config: AuthConfig) => void;
	declare updateAuth: (partial: Partial<AuthConfig>) => void;
	declare getAuth: () => Readonly<AuthConfig> | undefined;
	declare refreshAuth: () => Promise<void>;
	declare resolveUrl: (url: string, category?: UrlCategory) => Promise<ResolvedUrl>;
	declare setUrlResolver: (resolver: UrlResolver | undefined) => void;

	// ── Performance metrics / clock / accessibility ── composed in via `metricsMethods` mixin.
	declare metrics: () => PlaybackMetrics;
	declare recordMetric: (name: string, value: number) => void;
	declare now: () => number;
	declare announce: (text: string, level?: 'polite' | 'assertive') => void;
}

// Compose every shared player method onto the prototype. The kit's logic
// gets wired into the class here — no inheritance, no per-library duplication.
composeMixins(NMMusicPlayer.prototype, ...playerCoreMethods);

/**
 * Factory entry point.
 *
 * ```ts
 * const player = nmMPlayer<MyTrack>('player')
 *   .setup({ ... })
 *   .addPlugin(audioGraphPlugin)
 *   .addPlugin(equalizerPlugin);
 * ```
 */
export function nmMPlayer<T extends BasePlaylistItem = MusicPlaylistItem>(id?: string | number): NMMusicPlayer<T> {
	return new NMMusicPlayer<T>(id);
}

export default nmMPlayer;

// interface MyTrack extends MusicPlaylistItem {
// 	readonly: string;
// }
//
// const player = nmMPlayer<MyTrack>('player')
// 	.setup({
// 		accessToken: () => {
// 			return 'token';
// 		},
// 	})
// 	.addPlugin(CastSenderPlugin)
// 	.addPlugin(KeyHandlerPlugin)
// 	.addPlugin(LyricsPlugin)
// 	.addPlugin(MediaSessionPlugin)
// 	.addPlugin(AutoAdvancePlugin)
// 	.addPlugin(AudioGraphPlugin)
// 	.addPlugin(EqualizerPlugin, {
//
// 	})
// 	.addPlugin(TabLeaderPlugin, {
// 		getLockKey: () => ``,
// 		handoffOnVisible: true,
// 		onLost: 'pause',
// 	});
//
// player.on('all', (event) => {
// 	console.log(`Event: ${event.type}`, event);
// });
