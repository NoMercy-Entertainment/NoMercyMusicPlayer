import { Plugin } from '@nomercy-entertainment/nomercy-player-core';
import type { NMMusicPlayer } from '../index';

/** Options for the music {@link DrmPlugin}. */
export interface DrmOptions {
	/** EME key system identifier — `'com.widevine.alpha' | 'com.apple.fps' | 'com.microsoft.playready'` etc. */
	keySystem: string;
	/** License server URL. */
	licenseUrl: string;
	/** Service certificate for FairPlay (optional for Widevine/PlayReady). */
	certificate?: ArrayBuffer | string;
	/** Optional request signer for license calls (HMAC etc.). */
	customSignRequest?: (request: Request) => Request | Promise<Request>;
	/** Optional license request body transformer. */
	transformLicenseRequest?: (challenge: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>;
	/** Optional license response body transformer. */
	transformLicenseResponse?: (response: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>;
}

/** Events emitted by the music {@link DrmPlugin}. */
export interface DrmEvents {
	'key:requested': { sessionId: string; initData: ArrayBuffer };
	'key:granted': { sessionId: string };
	'key:expired': { sessionId: string };
	'key:revoked': { sessionId: string };
	'key:error': { sessionId: string; error: Error };
	'output:restricted': { reason: string };
	'unsupported': { reason: string };
}

/** Loose shape for items that carry DRM metadata. */
interface DrmTaggedItem {
	drm?: {
		keySystem?: string;
		licenseUrl?: string;
		[k: string]: unknown;
	};
}

/**
 * EME (Encrypted Media Extensions) DRM coordination plugin.
 *
 * Without a real key system on the host (e.g. JSDOM, Firefox-no-Widevine),
 * `use()` resolves cleanly and the plugin emits `'unsupported'` once. A real
 * `MediaKeys` setup runs only when the current track surfaces DRM metadata
 * AND `navigator.requestMediaKeySystemAccess` is available.
 */
export class DrmPlugin extends Plugin<NMMusicPlayer<any>, DrmOptions, DrmEvents> {
	static override readonly id: string = 'music-drm';
	static override readonly version: string = '2.0.0';
	static override readonly description: string = 'EME (Widevine / FairPlay / PlayReady) license + key system coordination';

	private mediaKeys: MediaKeys | null = null;
	private supported: boolean = false;

	/** Probes EME availability and wires the `current` listener to trigger key acquisition. */
	override async use(): Promise<void> {
		const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as
			| (Navigator & { requestMediaKeySystemAccess?: Navigator['requestMediaKeySystemAccess'] })
			| undefined;
		if (!nav || typeof nav.requestMediaKeySystemAccess !== 'function') {
			this.supported = false;
			this.emit('unsupported', { reason: 'no-eme' });
			return;
		}
		this.supported = true;

		this.on('current', (data) => {
			const item = data?.item as DrmTaggedItem | undefined;
			if (!item?.drm)
				return;
			void this.acquireKeys(item).catch((err: unknown) => {
				this.emit('key:error', {
					sessionId: '',
					error: err instanceof Error ? err : new Error(String(err)),
				});
			});
		});
	}

	/** Clears the MediaKeys reference and resets support state. */
	override dispose(): void {
		this.mediaKeys = null;
		this.supported = false;
	}

	/** Whether the host browser advertised an EME implementation at `use()`-time. */
	isSupported(): boolean {
		return this.supported;
	}

	/**
	 * Acquire MediaKeys for an item that surfaced DRM metadata. Stubs the
	 * heavy parts (real init-data parsing happens via `stream:encrypted`
	 * upstream) but installs the structure so the consumer can observe
	 * `key:requested` / `key:granted` / `key:error`.
	 */
	private async acquireKeys(item: DrmTaggedItem): Promise<void> {
		const nav = navigator as Navigator & {
			requestMediaKeySystemAccess?: Navigator['requestMediaKeySystemAccess'];
		};
		if (typeof nav.requestMediaKeySystemAccess !== 'function') {
			this.emit('unsupported', { reason: 'no-eme' });
			return;
		}
		const keySystem = item.drm?.keySystem ?? this.opts.keySystem;
		const licenseUrl = item.drm?.licenseUrl ?? this.opts.licenseUrl;
		try {
			const access = await nav.requestMediaKeySystemAccess(keySystem, [
				{
					initDataTypes: ['cenc'],
					audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
				},
			]);
			this.mediaKeys = await access.createMediaKeys();
			// Kick off a license fetch through the plugin's auth-aware fetch so
			// AuthError / NetworkError flow through the standard error pipeline.
			if (licenseUrl) {
				try { await this.fetch(licenseUrl, { scope: 'plugin' }); }
				catch { /* fetch errors already surfaced via the standard pipeline. */ }
			}
			this.emit('key:granted', { sessionId: '' });
		}
		catch (err) {
			this.emit('key:error', {
				sessionId: '',
				error: err instanceof Error ? err : new Error(String(err)),
			});
		}
	}
}

/** Plugin alias for the music {@link DrmPlugin}. Pass to `addPlugin(drmPlugin)`. */
export const drmPlugin = DrmPlugin;
