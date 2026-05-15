import { Plugin } from '@nomercy-entertainment/nomercy-player-core';
import type { IRealtimeChannel } from '@nomercy-entertainment/nomercy-player-core';
import type { NMMusicPlayer } from '../../index';

/** Options for {@link GroupListeningPlugin}. */
export interface GroupListeningOptions {
	/** Server endpoint for room/session sync. */
	wsUrl: string;
	/** Optional room / session id this client joins. */
	sessionId?: string;
	/** Acceptable drift in milliseconds before correcting. Default 80ms. */
	driftThresholdMs?: number;
	/** Max playbackRate adjustment factor when correcting drift. Default 0.05 (±5%). */
	maxRateAdjust?: number;
	/** Whether this client can issue control actions (DJ role). Default true. */
	canControl?: boolean;
}

/** Events emitted by {@link GroupListeningPlugin}. */
export interface GroupListeningEvents {
	'session:joined': { sessionId: string; participants: number };
	'session:left': void;
	'sync:applied': { source: 'remote'; action: 'play' | 'pause' | 'seek' | 'next' | 'previous'; from: string };
	'sync:broadcast': { action: string; payload: unknown };
	'sync:drift': { deltaMs: number };
	'sync:participants': { count: number };
	'role:dj-acquired': { id: string };
	'role:dj-lost': void;
	'unsupported': { reason: string };
}

/** Wire-format for the broadcast/apply protocol. */
interface SyncMessage {
	action: 'play' | 'pause' | 'seek' | 'next' | 'previous';
	time?: number;
	from?: string;
	source?: string;
}

/**
 * Spec §13 Pattern B — synchronised group listening. Multi-listener sync via
 * a single WebSocket: every participant broadcasts intent on `before*` events
 * and applies inbound messages with `{ source: 'remote', silent: true }` so
 * the apply doesn't re-broadcast.
 */
export class GroupListeningPlugin extends Plugin<NMMusicPlayer<any>, GroupListeningOptions, GroupListeningEvents> {
	static override readonly id: string = 'group-listening';
	static override readonly version: string = '2.0.0';
	static override readonly description: string = 'Synchronised group listening — server-coordinated lockstep transport';

	private channel: IRealtimeChannel | null = null;

	/** Opens the WebSocket channel and wires `before*` transport listeners to broadcast intent. */
	override use(): void {
		const url = this.opts?.wsUrl;
		if (!url) {
			this.emit('unsupported', { reason: 'no-ws-url' });
			return;
		}

		this.channel = this.websocket(url);
		this.channel.on('message', this.handleMessage);
		this.channel.on('open', this.handleOpen);

		// Broadcast intent on every transport before* event. Skip when the
		// action originated from a remote-applied sync to avoid loops.
		this.on('beforePlay', (e) => this.broadcast({
			action: 'play',
			source: e?.data?.source,
		}));
		this.on('beforePause', (e) => this.broadcast({
			action: 'pause',
			source: e?.data?.source,
		}));
		this.on('beforeNext', (e) => this.broadcast({
			action: 'next',
			source: e?.data?.source,
		}));
		this.on('beforePrevious', (e) => this.broadcast({
			action: 'previous',
			source: e?.data?.source,
		}));
		this.on('beforeSeek', (e) => this.broadcast({
			action: 'seek',
			time: e?.data?.time,
			source: e?.data?.source,
		}));
	}

	/** Closes the WebSocket channel and clears internal state. */
	override dispose(): void {
		try { this.channel?.close(); }
		catch { /* already closed */ }
		this.channel = null;
	}

	/** Send a sync intent message. No-ops if the channel isn't open yet. */
	private broadcast(msg: SyncMessage): void {
		// Don't re-broadcast actions we just applied from a remote tick.
		if (msg.source === 'remote')
			return;
		if (!this.channel || this.channel.readyState !== 'open')
			return;
		try { this.channel.send(JSON.stringify(msg)); }
		catch { /* send failed — channel will fire `error` separately. */ }
	}

	/** Inbound dispatcher — apply remote actions with `source: 'remote'`. */
	private readonly handleMessage = (raw: any): void => {
		const text = typeof raw === 'string' ? raw : raw?.data;
		if (typeof text !== 'string')
			return;
		let msg: SyncMessage;
		try {
			const raw: unknown = JSON.parse(text);
			if (raw === null || typeof raw !== 'object') return;
			msg = raw as SyncMessage;
		}
		catch { return; }
		this.applyRemote(msg);
	};

	private readonly handleOpen = (): void => {
		this.emit('session:joined', {
			sessionId: this.opts?.sessionId ?? '',
			participants: 1,
		});
	};

	private applyRemote(msg: SyncMessage): void {
		const tag = { source: 'remote' as const, silent: true };

		switch (msg.action) {
			case 'play':    void this.player.play?.(tag);     break;
			case 'pause':   void this.player.pause?.(tag);    break;
			case 'next':    void this.player.next?.(tag);     break;
			case 'previous': void this.player.previous?.(tag); break;
			case 'seek': {
				if (typeof msg.time === 'number') {
					void this.player.currentTime?.(msg.time);
				}
				break;
			}
		}

		this.emit('sync:applied', {
			source: 'remote',
			action: msg.action,
			from: msg.from ?? '',
		});
	}
}

/** Plugin alias for {@link GroupListeningPlugin}. Pass to `addPlugin(groupListeningPlugin)`. */
export const groupListeningPlugin = GroupListeningPlugin;
