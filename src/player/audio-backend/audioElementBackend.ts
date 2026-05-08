

import { notImplementedError } from '@nomercy-entertainment/nomercy-player-core';
import type { BackendEvent, BackendLoaderState, BackendState, IAudioBackend } from './backend';

type Listener = (data?: any) => void;

const isHls = (url: string): boolean => /\.m3u8(\?|$)/i.test(url);

const supportsNativeHls = (audio: HTMLAudioElement): boolean => {
	const can = audio.canPlayType('application/vnd.apple.mpegurl');
	return can === 'probably' || can === 'maybe';
};

interface HlsCtor {
	new (cfg?: unknown): {
		loadSource: (url: string) => void;
		attachMedia: (el: HTMLMediaElement) => void;
		destroy: () => void;
	};
	isSupported: () => boolean;
}

/**
 * Default backend. Uses an HTMLAudioElement for transport. Lazily creates a
 * MediaElementAudioSourceNode the first time a plugin requests the analyser
 * graph (so consumers without EQ/spectrum pay zero Web Audio cost).
 *
 * HLS support comes from the kit's stream registry — the registry resolves
 * the URL to a StreamSource (native or hls.js) and `attach()`es it to the
 * underlying `<audio>` element.
 */
export class AudioElementBackend implements IAudioBackend {
	readonly kind = 'audio-element' as const;

	private readonly element: HTMLAudioElement;
	private readonly ownsElement: boolean;
	private readonly container?: HTMLElement;
	private readonly listeners: Map<string, Set<Listener>> = new Map();
	private hlsInstance?: { destroy: () => void };
	private currentState: BackendState = 'idle';
	private prevVolume: number = 1;
	private domHandlers: Map<string, EventListener> = new Map();
	private disposed = false;

	constructor(container?: HTMLElement, opts?: { element?: HTMLAudioElement }) {
		this.container = container;
		if (opts?.element) {
			this.element = opts.element;
			this.ownsElement = false;
		} else {
			let existing: HTMLAudioElement | null = null;
			if (container) {
				existing = container.querySelector('audio');
			}
			if (existing) {
				this.element = existing;
				this.ownsElement = false;
			} else {
				this.element = document.createElement('audio');
				this.element.preload = 'metadata';
				this.ownsElement = true;
				if (container) container.appendChild(this.element);
			}
		}
		this.attachDomBridges();
	}

	private attachDomBridges(): void {
		const bridge = (domEvent: string, backendEvent: BackendEvent): void => {
			const handler: EventListener = (ev): void => {
				this.emit(backendEvent, ev);
			};
			this.element.addEventListener(domEvent, handler);
			this.domHandlers.set(domEvent, handler);
		};
		bridge('loadstart', 'loadstart');
		bridge('loadedmetadata', 'loadedmetadata');
		bridge('canplay', 'canplay');
		bridge('play', 'play');
		bridge('pause', 'pause');
		bridge('ended', 'ended');
		bridge('timeupdate', 'timeupdate');
		bridge('waiting', 'waiting');
		bridge('stalled', 'stalled');
		bridge('ratechange', 'ratechange');
		bridge('encrypted', 'encrypted');
		bridge('error', 'error');

		// Internal state tracking
		const setState = (s: BackendState): void => {
			this.currentState = s;
		};
		this.element.addEventListener('loadstart', () => setState('loading'));
		this.element.addEventListener('loadedmetadata', () => setState('ready'));
		this.element.addEventListener('play', () => setState('playing'));
		this.element.addEventListener('pause', () => {
			if (this.currentState !== 'idle' && this.currentState !== 'error') setState('paused');
		});
		this.element.addEventListener('ended', () => setState('paused'));
		this.element.addEventListener('error', () => setState('error'));
	}

	private emit(event: string, data?: unknown): void {
		const set = this.listeners.get(event);
		if (!set) return;
		for (const fn of set) {
			try { fn(data); }
			catch { /* swallow listener errors */ }
		}
	}

	async load(url: string, opts: { preload: 'auto' | 'metadata' | 'none' }): Promise<void> {
		this.element.preload = opts.preload;
		this.currentState = 'loading';
		this.emit('backend:loading', { url, kind: this.kind });

		// Tear down previous hls.js instance, if any.
		if (this.hlsInstance) {
			try { this.hlsInstance.destroy(); }
			catch { /* ignore */ }
			this.hlsInstance = undefined;
		}

		const useHlsJs = isHls(url) && !supportsNativeHls(this.element);

		await new Promise<void>((resolve, reject) => {
			const onLoaded = (): void => {
				cleanup();
				resolve();
			};
			const onError = (): void => {
				cleanup();
				reject(this.element.error ?? new Error('audio element load error'));
			};
			const cleanup = (): void => {
				this.element.removeEventListener('loadedmetadata', onLoaded);
				this.element.removeEventListener('error', onError);
			};
			this.element.addEventListener('loadedmetadata', onLoaded, { once: true });
			this.element.addEventListener('error', onError, { once: true });

			if (useHlsJs) {
				// hls.js is an optional peer dep — pulled in lazily only for HLS URLs
				// without native browser support. Resolved at runtime by the bundler.
				(new Function('m', 'return import(m)') as (m: string) => Promise<any>)('hls.js')
					.then((mod: any) => {
						const Hls = (mod.default ?? mod) as HlsCtor;
						if (!Hls.isSupported()) {
							this.element.src = url;
							this.element.load();
							return;
						}
						const hls = new Hls();
						hls.attachMedia(this.element);
						hls.loadSource(url);
						this.hlsInstance = hls;
					})
					.catch((err: unknown) => {
						cleanup();
						reject(err);
					});
			} else {
				this.element.src = url;
				this.element.load();
			}
		});

		const duration = Number.isFinite(this.element.duration) ? this.element.duration : 0;
		this.currentState = 'ready';
		this.emit('backend:loaded', { url, kind: this.kind, duration });
	}

	unload(): void {
		try { this.element.pause(); }
		catch { /* ignore */ }
		if (this.hlsInstance) {
			try { this.hlsInstance.destroy(); }
			catch { /* ignore */ }
			this.hlsInstance = undefined;
		}
		this.element.removeAttribute('src');
		try { this.element.load(); }
		catch { /* ignore */ }
		this.currentState = 'idle';
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.unload();
		for (const [evt, handler] of this.domHandlers) {
			this.element.removeEventListener(evt, handler);
		}
		this.domHandlers.clear();
		this.listeners.clear();
		if (this.ownsElement && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
	}

	play(): Promise<void> {
		const result = this.element.play();
		return result instanceof Promise ? result : Promise.resolve();
	}

	pause(): void {
		this.element.pause();
	}

	stop(): void {
		this.element.pause();
		try { this.element.currentTime = 0; }
		catch { /* ignore */ }
	}

	currentTime(): number;
	currentTime(t: number): void;
	currentTime(t?: number): number | void {
		if (t === undefined) return this.element.currentTime;
		return new Promise<void>((resolve) => {
			const onSeeked = (): void => {
				this.element.removeEventListener('seeked', onSeeked);
				resolve();
			};
			this.element.addEventListener('seeked', onSeeked, { once: true });
			try { this.element.currentTime = t; }
			catch {
				this.element.removeEventListener('seeked', onSeeked);
				resolve();
			}
		}) as unknown as void;
	}

	duration(): number {
		const d = this.element.duration;
		return Number.isFinite(d) ? d : 0;
	}

	buffered(): number {
		const ranges = this.element.buffered;
		if (!ranges || ranges.length === 0) return 0;
		return ranges.end(ranges.length - 1);
	}

	bufferedRanges(): TimeRanges {
		return this.element.buffered;
	}

	seekable(): TimeRanges {
		return this.element.seekable;
	}

	playbackRate(): number;
	playbackRate(rate: number): void;
	playbackRate(rate?: number): number | void {
		if (rate === undefined) return this.element.playbackRate;
		this.element.playbackRate = rate;
	}

	volume(): number;
	volume(v: number): void;
	volume(v?: number): number | void {
		if (v === undefined) return this.element.volume;
		const clamped = Math.max(0, Math.min(1, v));
		this.element.volume = clamped;
		if (clamped > 0) this.prevVolume = clamped;
	}

	mute(): void {
		if (!this.element.muted) {
			this.prevVolume = this.element.volume || this.prevVolume;
			this.element.muted = true;
		}
	}

	unmute(): void {
		this.element.muted = false;
	}

	state(): BackendState {
		return this.currentState;
	}

	outputNode(_ctx: AudioContext): AudioNode {
		throw notImplementedError('AudioElementBackend', 'outputNode');
	}

	analyserSource(_ctx: AudioContext): AudioNode {
		throw notImplementedError('AudioElementBackend', 'analyserSource');
	}

	mediaElement(): HTMLMediaElement {
		return this.element;
	}

	captureStream(): MediaStream {
		throw notImplementedError('AudioElementBackend', 'captureStream');
	}

	setSinkId(_deviceId: string): Promise<void> {
		throw notImplementedError('AudioElementBackend', 'setSinkId');
	}

	getSinkId(): string {
		throw notImplementedError('AudioElementBackend', 'getSinkId');
	}

	mediaKeys(): MediaKeys | undefined {
		throw notImplementedError('AudioElementBackend', 'mediaKeys');
	}

	setMediaKeys(_keys: MediaKeys): Promise<void> {
		throw notImplementedError('AudioElementBackend', 'setMediaKeys');
	}

	outputProtectionState(): 'unrestricted' | 'restricted' | 'unsupported' {
		throw notImplementedError('AudioElementBackend', 'outputProtectionState');
	}

	pauseLoader(): void {
		throw notImplementedError('AudioElementBackend', 'pauseLoader');
	}

	resumeLoader(): void {
		throw notImplementedError('AudioElementBackend', 'resumeLoader');
	}

	loaderState(): BackendLoaderState {
		throw notImplementedError('AudioElementBackend', 'loaderState');
	}

	on(event: BackendEvent, fn: (data?: any) => void): void {
		let set = this.listeners.get(event);
		if (!set) {
			set = new Set();
			this.listeners.set(event, set);
		}
		set.add(fn);
	}

	off(event: BackendEvent, fn: (data?: any) => void): void {
		const set = this.listeners.get(event);
		if (!set) return;
		set.delete(fn);
		if (set.size === 0) this.listeners.delete(event);
	}
}
