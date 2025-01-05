// noinspection JSUnusedGlobalSymbols

import AudioNode from './audioNode';

import type {
  EQBand, EQSliderValues, EqualizerPreset, IsMuted,
  IsPlaying, IsRepeating, IsShuffling, PlayerOptions,
  RepeatState, BasePlaylistItem, Time, TimeState, Volume,
} from './types';
import {PlayerState, VolumeState} from "./state";

import {equalizerBands, equalizerPresets, equalizerSliderValues} from "./equalizer";
import {ConstructorOptions} from "audiomotion-analyzer";

export default class Helpers<S extends BasePlaylistItem> extends EventTarget {
  public volume: Volume = Number(localStorage.getItem('nmplayer-music-volume')) || 100;
  public muted: IsMuted = false;
  public duration: Time = 0;
  public currentTime: Time = 0;
  public buffered: number = 0;
  public playbackRate: number = 1;
  public fadeDuration: number = 3;
  public currentSong: S | null = null;
  public state: PlayerState = PlayerState.IDLE;
  public volumeState: VolumeState = VolumeState.UNMUTED;
  public isShuffling: IsShuffling = false;
  public isRepeating: IsRepeating = false;
  public isMuted: IsMuted = false;
  public isPaused: boolean = false;
  public isPlaying: IsPlaying = false;
  public isStopped: boolean = false;
  public isSeeking: boolean = false;
  public isTransitioning: boolean = false;
  public newSourceLoaded: boolean = false;
  public baseUrl?: string = '/';
  public accessToken: string = '';
  protected _options: PlayerOptions = <PlayerOptions>{};

  public context: AudioContext | null = null;
  protected preGain: GainNode | null = null;
  protected filters: BiquadFilterNode[] = [];
  protected panner: StereoPannerNode | null = null;
  protected siteTitle: string = 'NoMercy Player';

  protected motionConfig: ConstructorOptions = {
	alphaBars: true,
	ansiBands: true,
	barSpace: 0.25,
	bgAlpha: 0,
	channelLayout: "dual-horizontal",
	colorMode: "bar-level",
	fadePeaks: false,
	fftSize: 16_384,
	fillAlpha: 0.5,
	frequencyScale: "log",
	gravity: 3.8,
	height: undefined,
	ledBars: false,
	lineWidth: 5,
	linearAmplitude: true,
	linearBoost: 1.4,
	loRes: false,
	lumiBars: false,
	maxDecibels: -35,
	maxFPS: 60,
	maxFreq: 16000,
	minDecibels: -85,
	minFreq: 30,
	mirror: 0,
	mode: 2,
	noteLabels: false,
	outlineBars: false,
	overlay: true,
	peakFadeTime: 750,
	peakHoldTime: 500,
	peakLine: false,
	radial: false,
	radialInvert: false,
	radius: 0.3,
	reflexAlpha: 1,
	reflexBright: 1,
	reflexFit: true,
	reflexRatio: 0.5,
	roundBars: false,
	showBgColor: false,
	showFPS: false,
	showPeaks: false,
	showScaleX: false,
	showScaleY: false,
	smoothing: 0.7,
	spinSpeed: 1,
	splitGradient: false,
	trueLeds: false,
	useCanvas: true,
	volume: 1,
	weightingFilter: "D",
	width: undefined,
  }

  protected motionColors: string[] = [];

  equalizerPanning = 0;
  equalizerSliderValues: EQSliderValues;
  equalizerBands: EQBand[];
  equalizerPresets: EqualizerPreset[];

  _audioElement1: AudioNode<S> = new AudioNode({
	  id: 1,
	  volume: this.volume / 100,
	  bands: equalizerBands,
	  motionConfig: this.motionConfig,
	  motionColors: this.motionColors
	},
	this
  );

  _audioElement2: AudioNode<S> = new AudioNode({
	  id: 2,
	  volume: this.volume / 100,
	  bands: equalizerBands,
	  motionConfig: this.motionConfig,
	  motionColors: this.motionColors
	},
	this
  );
  _currentAudio: AudioNode<S> = this._audioElement1;
  protected _nextAudio: AudioNode<S> = this._audioElement2;

  constructor() {
	super();

	this.equalizerBands = equalizerBands;
	this.equalizerSliderValues = equalizerSliderValues;
	this.equalizerPresets = equalizerPresets;

	this._audioElement1.context = this.context;
	this._audioElement1._preGain = this.preGain;
	this._audioElement1._filters = this.filters;
	this._audioElement1._panner = this.panner;

	this._audioElement2.context = this.context;
	this._audioElement2._preGain = this.preGain;
	this._audioElement2._filters = this.filters;
	this._audioElement2._panner = this.panner;
  }

  public setAccessToken(accessToken: string): void {
	this.accessToken = accessToken;

	this._audioElement1.setAccessToken(accessToken);
	this._audioElement2.setAccessToken(accessToken);
  }

  public setBaseUrl(baseUrl?: string): void {
	this.baseUrl = baseUrl;
  }

  public getNewSource(newItem: S | null): Promise<string> {
	if (!newItem?.path) throw new Error('No path provided for new source');
	return new Promise((resolve) => {
	  return resolve(
		encodeURI(
		  `${this.baseUrl}${newItem?.path}`
		).replace(/#/u, '%23')
	  );
	}) as unknown as Promise<string>;
  }

  loadEqualizerSettings() {
	const settings = localStorage.getItem('nmplayer-music-equalizer-settings');
	if (settings) {
	  this.equalizerBands = JSON.parse(settings);

	  for (const band of this.equalizerBands) {
		if (band.frequency === 'Pre') {
		  this?.setPreGain(band.gain);
		  continue;
		}

		this.setFilter(band);
	  }
	}
  }

  public setPreGain(gain: number): void {
	this.emit('setPreGain', gain);
  }

  public setPanner(pan: number): void {
	this.equalizerPanning = pan;
	this.emit('setPanner', pan);
  }

  public setFilter(filter: EQBand): void {
	this.emit('setFilter', filter);
  }

  public saveEqualizerSettings() {
	localStorage.setItem('nmplayer-music-equalizer-settings', JSON.stringify(this.equalizerBands));
  }

  protected setTitle(arg?: string | null) {
	if (!arg || arg == '') {
	  document.title = this.siteTitle;
	  return;
	}

	const res: string[] = [];

	if (arg) {
	  res.push(arg);
	}
	// If the app is not installed, add a dash and the site title
	if (!window.matchMedia('(display-mode: standalone)').matches) {
	  if (arg) {
		res.push('-');
	  }
	  res.push(this.siteTitle);
	}

	document.title = res.join(' ');
  }

  /**
   * Trigger an event on the player.
   * @param event type of event to trigger
   * @param data  data to pass with the event
   */
  emit(event: 'duration', data: number): void;
  emit(event: 'loadstart', source: HTMLAudioElement): void;
  emit(event: 'loadedmetadata', source: HTMLAudioElement): void;
  emit(event: 'canplay', source: HTMLAudioElement): void;
  emit(event: 'waiting', source: HTMLAudioElement): void;
  emit(event: 'error', source: HTMLAudioElement): void;
  emit(event: 'ended', source: HTMLAudioElement): void;
  emit(event: 'pause', source: HTMLAudioElement): void;
  emit(event: 'play', source: HTMLAudioElement): void;
  emit(event: 'stop'): void;
  emit(event: 'pause-internal', source: HTMLAudioElement): void;
  emit(event: 'play-internal', source: HTMLAudioElement): void;
  emit(event: 'queueNext'): void;
  emit(event: 'startFadeOut'): void;
  emit(event: 'endFadeOut'): void;
  emit(event: 'nextSong'): void;
  emit(event: 'ready'): void;
  emit(event: 'song', data: S | null): void;
  emit(event: 'backlog', data: S[]): void;
  emit(event: 'queue', data: S[]): void;
  emit(event: 'shuffle', data: IsShuffling): void;
  emit(event: 'mute', data: IsMuted): void;
  emit(event: 'repeat', data: RepeatState): void;
  emit(event: 'seeked', data: TimeState): void;
  emit(event: 'setCurrentAudio', data: HTMLAudioElement): void;
  emit(event: 'time', data: TimeState): void;
  emit(event: 'time-internal', data: TimeState): void;
  emit(event: 'volume', data: Volume): void;
  emit(event: 'setPreGain', data: number): void;
  emit(event: 'setPanner', data: number): void;
  emit(event: 'setFilter', data: EQBand): void;
  emit(event: any, data?: any): void {
	if (!data || typeof data === 'string') {
	  data = data ?? '';
	} else if (typeof data === 'object') {
	  data = {...(data ?? {})};
	}

	this.dispatchEvent?.(
	  new CustomEvent(event, {
		detail: data,
	  })
	);
  }

  /**
   * Adds an event listener to the player.
   * @param event - The event to listen for.
   * @param callback - The function to execute when the event occurs.
   */
  on(event: 'duration', callback: (data: Time) => void): void;
  on(event: 'loadstart', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'loadedmetadata', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'canplay', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'waiting', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'error', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'ended', callback: (element: HTMLAudioElement) => void): void;
  on(event: 'pause', callback: () => void): void;
  on(event: 'play', callback: () => void): void;
  on(event: 'stop', callback: () => void): void;
  on(event: 'pause-internal', callback: () => void): void;
  on(event: 'play-internal', callback: () => void): void;
  on(event: 'queueNext', callback: () => void): void;
  on(event: 'startFadeOut', callback: () => void): void;
  on(event: 'endFadeOut', callback: () => void): void;
  on(event: 'nextSong', callback: () => void): void;
  on(event: 'ready', callback: () => void): void;
  on(event: 'song', callback: (data: S | null) => void): void;
  on(event: 'backlog', callback: (data: S[]) => void): void;
  on(event: 'queue', callback: (data: S[]) => void): void;
  on(event: 'shuffle', callback: (data: IsShuffling) => void): void;
  on(event: 'mute', callback: (data: IsMuted) => void): void;
  on(event: 'repeat', callback: (data: RepeatState) => void): void;
  on(event: 'seeked', callback: (data: TimeState) => void): void;
  on(event: 'setCurrentAudio', callback: () => void): void;
  on(event: 'time', callback: (data: TimeState) => void): void;
  on(event: 'time-internal', callback: (data: TimeState) => void): void;
  on(event: 'volume', callback: (data: Volume) => void): void;
  on(event: 'setPreGain', callback: (data: number) => void): void;
  on(event: 'setPanner', callback: (data: number) => void): void;
  on(event: 'setFilter', callback: (data: EQBand) => void): void;
  on(event: any, callback: (arg0?: any) => any) {
	this.addEventListener(event, (e) => callback((e as any).detail));
  }

  /**
   * Removes an event listener from the player.
   * @param event - The event to remove.
   * @param callback - The function to remove.
   */
  off(event: 'duration', callback: (data: Time) => void): void;
  off(event: 'loadstart', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'loadedmetadata', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'canplay', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'waiting', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'error', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'ended', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'pause', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'play', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'stop', callback: () => void): void;
  off(event: 'pause-internal', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'play-internal', callback: (source: HTMLAudioElement) => void): void;
  off(event: 'queueNext', callback: () => void): void;
  off(event: 'startFadeOut', callback: () => void): void;
  off(event: 'endFadeOut', callback: () => void): void;
  off(event: 'nextSong', callback: () => void): void;
  off(event: 'ready', callback: () => void): void;
  off(event: 'song', callback: (data: S | null) => void): void;
  off(event: 'backlog', callback: (data: S[]) => void): void;
  off(event: 'queue', callback: (data: S[]) => void): void;
  off(event: 'shuffle', callback: (data: IsShuffling) => void): void;
  off(event: 'mute', callback: (data: IsMuted) => void): void;
  off(event: 'repeat', callback: (data: RepeatState) => void): void;
  off(event: 'seeked', callback: (data: TimeState) => void): void;
  off(event: 'setCurrentAudio', callback: (data: HTMLAudioElement) => void): void;
  off(event: 'time', callback: (data: TimeState) => void): void;
  off(event: 'time-internal', callback: (data: TimeState) => void): void;
  off(event: 'volume', callback: (data: Volume) => void): void;
  off(event: 'setPreGain', callback: (data: number) => void): void;
  off(event: 'setPanner', callback: (data: number) => void): void;
  off(event: 'setFilter', callback: (data: EQBand) => void): void;
  off(event: any, callback: (arg0: any) => any) {
	this.removeEventListener(event, (e) => callback((e as any).detail));
  }

  /**
   * Adds an event listener to the player that will only be called once.
   * @param event - The event to listen for.
   * @param callback - The function to execute when the event occurs.
   */
  once(event: 'duration', callback: (data: Time) => void): void;
  once(event: 'loadstart', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'loadedmetadata', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'canplay', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'waiting', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'error', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'ended', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'pause', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'play', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'pause-internal', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'play-internal', callback: (source: HTMLAudioElement) => void): void;
  once(event: 'queueNext', callback: () => void): void;
  once(event: 'startFadeOut', callback: () => void): void;
  once(event: 'endFadeOut', callback: () => void): void;
  once(event: 'nextSong', callback: () => void): void;
  once(event: 'ready', callback: () => void): void;
  once(event: 'song', callback: (data: S | null) => void): void;
  once(event: 'backlog', callback: (data: S[]) => void): void;
  once(event: 'queue', callback: (data: S[]) => void): void;
  once(event: 'shuffle', callback: (data: IsShuffling) => void): void;
  once(event: 'mute', callback: (data: IsMuted) => void): void;
  once(event: 'repeat', callback: (data: RepeatState) => void): void;
  once(event: 'seeked', callback: (data: TimeState) => void): void;
  once(event: 'setCurrentAudio', callback: (data: HTMLAudioElement) => void): void;
  once(event: 'time', callback: (data: TimeState) => void): void;
  once(event: 'time-internal', callback: (data: TimeState) => void): void;
  once(event: 'volume', callback: (data: Volume) => void): void;
  once(event: 'setPreGain', callback: (data: number) => void): void;
  once(event: 'setPanner', callback: (data: number) => void): void;
  once(event: 'setFilter', callback: (data: EQBand) => void): void;
  once(event: any, callback: (arg0: any) => any) {
	this.addEventListener(
	  event,
	  (e) => callback((e as any).detail),
	  {once: true}
	);
  }

}
