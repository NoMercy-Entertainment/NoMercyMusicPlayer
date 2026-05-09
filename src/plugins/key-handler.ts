import { KeyHandlerPlugin as BaseKeyHandler } from '@nomercy-entertainment/nomercy-player-core/plugins/key-handler';
import type { NMMusicPlayer } from '../index';
import { RepeatState, ShuffleState } from '../types';

/** Loose surface for music transport methods we read off the player. */
interface MusicSurface {
	next?: () => unknown;
	previous?: () => unknown;
	repeatState?: ((state?: RepeatState) => RepeatState | unknown);
	shuffleState?: ((state?: ShuffleState | boolean) => ShuffleState | unknown);
}

/**
 * Music-specific key handler. Inherits all kit defaults (space=play/pause,
 * arrows=seek, m=mute) and adds music-specific bindings:
 *
 *  - `n` → next track
 *  - `p` → previous track
 *  - `r` → cycle repeat state (off → all → one → off)
 *  - `s` → toggle shuffle
 */
export class KeyHandlerPlugin extends BaseKeyHandler<NMMusicPlayer<any>> {
	static override readonly id: string = 'key-handler';

	/** Only override `addMediaKeys` — kit's default playback / nav / volume groups carry over. */
	protected override addMediaKeys(): void {
		super.addMediaKeys();
		const surface = (): MusicSurface => this.player as unknown as MusicSurface;

		this.bind('n', () => { void surface().next?.(); });
		this.bind('p', () => { void surface().previous?.(); });

		this.bind('r', () => {
			const s = surface();
			if (typeof s.repeatState !== 'function')
				return;
			const current = s.repeatState() as RepeatState | undefined;
			const nextState
				= current === RepeatState.OFF
					? RepeatState.ALL
					: current === RepeatState.ALL
						? RepeatState.ONE
						: RepeatState.OFF;
			(s.repeatState as (state: RepeatState) => unknown)(nextState);
		});

		this.bind('s', () => {
			const s = surface();
			if (typeof s.shuffleState !== 'function')
				return;
			const current = s.shuffleState() as ShuffleState | undefined;
			const nextState = current === ShuffleState.ON ? ShuffleState.OFF : ShuffleState.ON;
			(s.shuffleState as (state: ShuffleState) => unknown)(nextState);
		});
	}
}

export const keyHandlerPlugin = KeyHandlerPlugin;
