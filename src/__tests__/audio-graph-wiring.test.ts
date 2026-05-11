/**
 * Audio graph wiring regression.
 *
 * Verifies that the `AudioElementBackend` outputGain node reaches
 * `ctx.destination` — either directly (baseline, no plugin) or through the
 * `AudioGraphPlugin` chain (plugin present).
 *
 * Root cause of the original silence bug:
 *   `ensureSourceGraph` built `source → analyser → outputGain` but never
 *   connected `outputGain → ctx.destination`. AudioGraphPlugin then called
 *   `createMediaElementSource(element)` a second time; Chrome returned a
 *   silent node without throwing. Both paths produced no audio.
 *
 * Fix (Option A + baseline):
 *   - `ensureSourceGraph` now connects `outputGain → ctx.destination` so audio
 *     plays even without any plugin.
 *   - `AudioGraphPlugin.mountSource` calls `backend.outputNode(ctx)` and reuses
 *     the backend's outputGain as the chain head, then `rebuildChain` reconnects
 *     it through effects → destination (replacing the baseline connection).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioElementBackend } from '../player/audio-backend/audioElementBackend';

// ── Web Audio stubs ───────────────────────────────────────────────────────────

class MockDestinationNode {
	label = 'destination';
}

class MockGainNode {
	_connections: unknown[] = [];
	gain = { value: 1 };

	connect(target: unknown): void {
		this._connections.push(target);
	}

	disconnect(): void {
		this._connections = [];
	}
}

class MockAnalyserNode {
	fftSize = 2048;
	_connections: unknown[] = [];

	connect(target: unknown): void {
		this._connections.push(target);
	}

	disconnect(): void {
		this._connections = [];
	}
}

class MockSourceNode {
	_connections: unknown[] = [];

	connect(target: unknown): void {
		this._connections.push(target);
	}

	disconnect(): void {
		this._connections = [];
	}
}

class MockAudioContext {
	state: AudioContextState = 'running';
	currentTime = 0;
	destination = new MockDestinationNode() as unknown as AudioDestinationNode;
	sampleRate = 44100;

	createGain = vi.fn((): MockGainNode => new MockGainNode());
	createAnalyser = vi.fn((): MockAnalyserNode => new MockAnalyserNode());
	createMediaElementSource = vi.fn((): MockSourceNode => new MockSourceNode());
	resume = vi.fn(() => Promise.resolve());
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function installAudioContext(): void {
	(globalThis as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;
}

function removeAudioContext(): void {
	delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AudioElementBackend — ensureSourceGraph baseline wiring', () => {
	beforeEach(() => {
		installAudioContext();
	});

	afterEach(() => {
		removeAudioContext();
		document.body.innerHTML = '';
	});

	it('createMediaElementSource is called exactly once per AudioContext', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		backend.outputNode(ctx);
		backend.outputNode(ctx);

		expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
	});

	it('outputGain is connected to ctx.destination by default (baseline — no plugin)', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		backend.outputNode(ctx);

		const gainNode = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockGainNode;
		expect(gainNode).toBeDefined();
		expect(gainNode._connections).toContain(ctx.destination);
	});

	it('outputNode(ctx) returns the GainNode (chain tail), not the raw MediaElementSource', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		const outputNode = backend.outputNode(ctx);

		const gainNode = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results[0]?.value;
		expect(outputNode).toBe(gainNode);
	});

	it('signal chain is source → analyser → outputGain → destination', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		backend.outputNode(ctx);

		const sourceNode = (ctx.createMediaElementSource as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockSourceNode;
		const analyserNode = (ctx.createAnalyser as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockAnalyserNode;
		const gainNode = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results[0]?.value as MockGainNode;

		expect(sourceNode._connections).toContain(analyserNode);
		expect(analyserNode._connections).toContain(gainNode);
		expect(gainNode._connections).toContain(ctx.destination);
	});

	it('outputNode is idempotent — same GainNode returned on repeat calls with same ctx', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		const first = backend.outputNode(ctx);
		const second = backend.outputNode(ctx);

		expect(first).toBe(second);
		expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
	});

	it('analyserSource returns the AnalyserNode (parallel tap), not the GainNode', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const backend = new AudioElementBackend(container);
		const ctx = new MockAudioContext() as unknown as AudioContext;

		backend.outputNode(ctx);
		const analyserTap = backend.analyserSource(ctx);

		const analyserNode = (ctx.createAnalyser as ReturnType<typeof vi.fn>).mock.results[0]?.value;
		expect(analyserTap).toBe(analyserNode);
	});
});
