/**
 * Volume tests for NMMusicPlayer. Locks the overloaded `volume()` accessor +
 * mute/unmute/toggleMute + volumeUp/Down step contract.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NMMusicPlayer } from '../index';

describe('NMMusicPlayer — volume', () => {
	beforeEach(() => {
		(NMMusicPlayer as unknown as { _resetRegistry: () => void })._resetRegistry();
		const div = document.createElement('div');
		div.id = 'test';
		document.body.appendChild(div);
	});

	afterEach(() => {
		(NMMusicPlayer as unknown as { _resetRegistry: () => void })._resetRegistry();
		document.body.innerHTML = '';
	});

	const setup = (cfg = {}): NMMusicPlayer => new NMMusicPlayer('test').setup(cfg);

	describe('volume()', () => {
		it('returns the default 1.0 when no defaultVolume is configured', () => {
			expect(setup().volume()).toBe(1);
		});

		it('honors config.defaultVolume', () => {
			expect(setup({ defaultVolume: 0.4 }).volume()).toBe(0.4);
		});

		it('round-trips through the writer', () => {
			const p = setup();
			p.volume(0.5);
			expect(p.volume()).toBe(0.5);
		});

		it('clamps below 0 to 0', () => {
			const p = setup();
			p.volume(-0.5);
			expect(p.volume()).toBe(0);
		});

		it('clamps above 1 to 1', () => {
			const p = setup();
			p.volume(2);
			expect(p.volume()).toBe(1);
		});

		it('emits "volume" with the new level', () => {
			const p = setup();
			let level: number | undefined;
			p.on('volume' as any, (data: any) => { level = data.level; });
			p.volume(0.7);
			expect(level).toBe(0.7);
		});
	});

	describe('mute / unmute', () => {
		it('mute() emits "mute" with muted=true', () => {
			const p = setup();
			let muted: boolean | undefined;
			p.on('mute' as any, (data: any) => { muted = data.muted; });
			p.mute();
			expect(muted).toBe(true);
		});

		it('unmute() emits "mute" with muted=false', () => {
			const p = setup();
			p.mute();
			let muted: boolean | undefined;
			p.on('mute' as any, (data: any) => { muted = data.muted; });
			p.unmute();
			expect(muted).toBe(false);
		});

		it('mute preserves the previous level so unmute restores it', () => {
			const p = setup();
			p.volume(0.6);
			p.mute();
			expect(p.volume()).toBe(0); // muted reads as 0
			p.unmute();
			expect(p.volume()).toBe(0.6);
		});
	});

	describe('volumeUp / volumeDown', () => {
		it('volumeUp(0.1) increments by 0.1', () => {
			const p = setup({ defaultVolume: 0.5 });
			p.volumeUp(0.1);
			expect(p.volume()).toBeCloseTo(0.6);
		});

		it('volumeDown(0.2) decrements by 0.2', () => {
			const p = setup({ defaultVolume: 0.5 });
			p.volumeDown(0.2);
			expect(p.volume()).toBeCloseTo(0.3);
		});

		it('volumeUp clamps at 1', () => {
			const p = setup({ defaultVolume: 0.95 });
			p.volumeUp(0.2);
			expect(p.volume()).toBe(1);
		});

		it('volumeDown clamps at 0', () => {
			const p = setup({ defaultVolume: 0.05 });
			p.volumeDown(0.2);
			expect(p.volume()).toBe(0);
		});
	});
});
