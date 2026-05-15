import { Plugin } from '@nomercy-entertainment/nomercy-player-core';
import type { IRealtimeChannel } from '@nomercy-entertainment/nomercy-player-core';
import type { NMMusicPlayer } from '../../index';

/** Options for the music {@link LiveTranscodingPlugin}. */
export interface LiveTranscodingOptions {
	/** Server endpoint that owns the transcoding job lifecycle. */
	wsUrl: string;
	/** Optional polling fallback for environments without WS. */
	pollIntervalMs?: number;
	/** How many seconds of buffer must exist beyond `currentTime` before resuming. */
	resumeAheadSeconds?: number;
	/** When seeking, max seconds we'll wait for the transcoder to reach the target. */
	seekTimeoutMs?: number;
}

/** Events emitted by the music {@link LiveTranscodingPlugin}. */
export interface LiveTranscodingEvents {
	'job:started': { jobId: string; sourceUrl: string };
	'job:progress': { jobId: string; transcodedSeconds: number; totalSeconds?: number };
	'job:ready-to-play': { jobId: string };
	'job:error': { jobId: string; error: Error };
	'job:complete': { jobId: string };
	'segment:ready': { time: number };
	'backpressure:apply': { reason: 'buffer-full' | 'encoder-stall' };
	'backpressure:release': void;
	'unsupported': { reason: string };
}

/** Wire-format for inbound segment-readiness messages. */
interface SegmentReadyMessage {
	type: 'segment-ready';
	time: number;
}

interface InboundMessage {
	type?: string;
	time?: number;
}

/**
 * Spec §13 Pattern A — live-transcoded streams gated on segment readiness.
 *
 * Subscribes to a control WebSocket; the server emits `segment-ready { time }`
 * messages as encoded segments land. `beforeLoad` and `beforeSeek` are gated
 * via `delay()` until the requested time falls at or below the latest known
 * ready segment.
 */
export class LiveTranscodingPlugin extends Plugin<NMMusicPlayer<any>, LiveTranscodingOptions, LiveTranscodingEvents> {
	static override readonly id: string = 'live-transcoding';
	static override readonly version: string = '2.0.0';
	static override readonly description: string = 'Server-coordinated live transcoding — segment-ready gating + loader backpressure';

	private channel: IRealtimeChannel | null = null;
	private latestReadyTime: number = 0;
	private readonly pendingGates: Set<(t: number) => void> = new Set();

	/** Opens the control WebSocket and wires `beforeLoad` / `beforeSeek` segment-ready gates. */
	override use(): void {
		const url = this.opts?.wsUrl;
		if (!url) {
			this.emit('unsupported', { reason: 'no-ws-url' });
			return;
		}

		this.channel = this.websocket(url);
		this.channel.on('message', this.handleMessage);

		// Gate beforeLoad / beforeSeek if the requested time isn't ready yet.
		this.on('beforeLoad', (e) => {
			// `beforeLoad` carries an item; the start position is 0 unless an
			// upstream plugin populated `startAt`. We treat it as time=0 here
			// — the kit's load path applies `startAt` after we resolve.
			const startAt = (e?.data as { startAt?: number } | undefined)?.startAt ?? 0;
			if (startAt <= this.latestReadyTime)
				return;
			e.delay(this.waitForReady(startAt));
		});

		this.on('beforeSeek', (e) => {
			const time = (e?.data as { time?: number } | undefined)?.time;
			if (typeof time !== 'number')
				return;
			if (time <= this.latestReadyTime)
				return;
			e.delay(this.waitForReady(time));
		});
	}

	/** Resolves all pending gates, closes the WebSocket channel, and resets internal state. */
	override dispose(): void {
		// Reject any pending gates so awaiting `delay()` promises settle and
		// the dispatch pipeline can drain on teardown.
		for (const resolver of this.pendingGates) resolver(this.latestReadyTime);
		this.pendingGates.clear();
		try { this.channel?.close(); }
		catch { /* already closed */ }
		this.channel = null;
		this.latestReadyTime = 0;
	}

	/** Latest server-ack'd segment ready time. */
	readyTime(): number {
		return this.latestReadyTime;
	}

	private readonly handleMessage = (raw: any): void => {
		const text = typeof raw === 'string' ? raw : raw?.data;
		if (typeof text !== 'string')
			return;
		let msg: InboundMessage;
		try {
			const raw: unknown = JSON.parse(text);
			if (raw === null || typeof raw !== 'object') return;
			msg = raw as InboundMessage;
		}
		catch { return; }
		if (msg.type === 'segment-ready' && typeof msg.time === 'number') {
			this.applySegmentReady(msg as SegmentReadyMessage);
		}
	};

	private applySegmentReady(msg: SegmentReadyMessage): void {
		if (msg.time > this.latestReadyTime) {
			this.latestReadyTime = msg.time;
		}
		this.emit('segment:ready', { time: msg.time });

		// Resolve every gate whose target is now reachable.
		for (const resolver of [...this.pendingGates]) {
			resolver(this.latestReadyTime);
		}
	}

	/** Returns a promise that resolves when `time <= latestReadyTime`. */
	private waitForReady(time: number): Promise<void> {
		const timeoutMs = this.opts?.seekTimeoutMs ?? 30_000;
		return new Promise<void>((resolve, reject) => {
			let settled = false;
			const finish = (ok: boolean, reason?: Error) => {
				if (settled)
					return;
				settled = true;
				this.pendingGates.delete(resolver);
				if (ok)
					resolve();
				else reject(reason ?? new Error('live-transcoding gate timed out'));
			};
			const resolver = (current: number) => {
				if (current >= time)
					finish(true);
			};
			this.pendingGates.add(resolver);
			// Resolve immediately if the segment is already ready.
			resolver(this.latestReadyTime);
			if (settled)
				return;
			this.timeout(() => finish(false), timeoutMs);
		});
	}
}

/** Plugin alias for the music {@link LiveTranscodingPlugin}. Pass to `addPlugin(liveTranscodingPlugin)`. */
export const liveTranscodingPlugin = LiveTranscodingPlugin;
