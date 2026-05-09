

import type { AudioBackendKind } from '../../types';

/** Backend-internal events forwarded to the player's eventTarget. */
export type BackendEvent =
	| 'loadstart'
	| 'loadedmetadata'
	| 'canplay'
	| 'play'
	| 'pause'
	| 'ended'
	| 'timeupdate'
	| 'waiting'
	| 'stalled'
	| 'ratechange'
	| 'encrypted'
	| 'error';

/** Backend lifecycle state. Returned by `state()`. */
export type BackendState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

/** Backend loader state — used for backpressure when an upstream encoder is gating output. */
export type BackendLoaderState = 'running' | 'paused';

/**
 * Concrete contract every backend implements. The Player calls these; plugins
 * tap into `outputNode` / `analyserSource` to build effect chains.
 *
 * Two implementations:
 *   - `audioElementBackend` (default) — `<audio>` + lazy MediaElementSource
 *   - `webAudioBackend` — decoded buffer + AudioBufferSourceNode (HLS falls back to MediaElementSource)
 *
 * Method conventions (matches the Player class):
 *   - **Stateful = overloaded function:** `volume()` / `volume(v)`
 *   - **Action = verb:** `play()`, `pause()`, `stop()`, `mute()`, `unmute()`
 *   - **Time / position uses `currentTime(t)` for seeking** — no separate `seek`
 */
export interface IAudioBackend {
	readonly kind: AudioBackendKind;

	// Lifecycle
	load(url: string, opts: { preload: 'auto' | 'metadata' | 'none' }): Promise<void>;
	unload(): void;
	dispose(): void;

	// Transport
	play(): Promise<void>;
	pause(): void;
	stop(): void;

	// Time / position
	currentTime(): number;
	currentTime(t: number): void;
	duration(): number;
	buffered(): number;
	bufferedRanges(): TimeRanges;
	seekable(): TimeRanges;
	playbackRate(): number;
	playbackRate(rate: number): void;

	// Volume
	volume(): number;
	volume(v: number): void;
	mute(): void;
	unmute(): void;

	// State
	state(): BackendState;

	// Effect-chain mount points — audio-graph plugins tap these
	outputNode(ctx: AudioContext): AudioNode;
	analyserSource(ctx: AudioContext): AudioNode;

	// Raw element access — cast SDKs and other low-level integrations bind here
	mediaElement(): HTMLMediaElement;

	// MediaStream capture — clip / record plugins consume this
	captureStream(): MediaStream;

	// Audio output device routing
	setSinkId(deviceId: string): Promise<void>;
	getSinkId(): string;

	// EME / DRM
	mediaKeys(): MediaKeys | undefined;
	setMediaKeys(keys: MediaKeys): Promise<void>;
	/** HDCP / output-protection capability of the current sink. */
	outputProtectionState(): 'unrestricted' | 'restricted' | 'unsupported';

	// Loader backpressure — caller pauses fetch when an upstream gate
	// (encoder, transcode pipeline) needs the buffer to drain first.
	pauseLoader(): void;
	resumeLoader(): void;
	loaderState(): BackendLoaderState;

	// Events
	on(event: BackendEvent, fn: (data?: any) => void): void;
	off(event: BackendEvent, fn: (data?: any) => void): void;
}
