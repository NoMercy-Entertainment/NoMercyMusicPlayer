// noinspection JSUnusedGlobalSymbols

import MediaSession from '@nomercy-entertainment/media-session';
import Queue from './queue';

import {PlayerOptions, type BasePlaylistItem, TimeState} from './types';
import {PlayerState, VolumeState} from "./state";

export class PlayerCore<S extends BasePlaylistItem> extends Queue<S> {
  mediaSession: MediaSession;

  constructor(config: PlayerOptions) {
	super();

	this._initializeCore();

	if (config.expose) {
	  window.musicPlayer = this;
	}
	this.mediaSession = new MediaSession();

	this.baseUrl = config.baseUrl;

	if (config.motionConfig) {
	  this.motionConfig = config.motionConfig;
	}
	if (config.motionColors) {
	  this.motionColors = config.motionColors;
	}
	if (config.siteTitle) {
	  this.siteTitle = config.siteTitle;
	}
  }

  public dispose(): void {
	this._audioElement1.dispose();
	this._audioElement2.dispose();

	this.mediaSession?.setPlaybackState('none');
  }

  public play(): Promise<void> {
	return this._currentAudio.play();
  }

  public pause(): void {
	this._currentAudio.pause();
  }

  public togglePlayback(): void {
	if (this.isPlaying) {
	  this.pause();
	} else {
	  this.play().then();
	}
  }

  public stop(): void {
	this._currentAudio.stop();
	this.currentSong = null;
	this.state = PlayerState.STOPPED;

	this.emit('song', null);
	this.emit('stop');

	this.setQueue([]);

	this.mediaSession?.setPlaybackState('none');
  }

  public setVolume(volume: number) {
	const newVolume = Math.floor(volume);

	this._currentAudio.setVolume(newVolume);
	this._nextAudio.setVolume(newVolume);

	localStorage.setItem('nmplayer-music-volume', newVolume.toString());
  }

  public getVolume(): number {
	return this._currentAudio.getVolume();
  }

  public mute(): void {
	this._currentAudio.mute();
	this._nextAudio.mute();

	this.volumeState = VolumeState.MUTED;
	this.isMuted = true;
	this.emit('mute', true);
	localStorage.setItem('nmplayer-music-muted', 'true');
  }

  public unmute(): void {
	this._currentAudio.unmute();
	this._nextAudio.unmute();

	this.volumeState = VolumeState.UNMUTED;
	this.isMuted = false;
	this.emit('mute', false);
	localStorage.setItem('nmplayer-music-muted', 'false');
  }

  public toggleMute(): void {
	if (this.volumeState === VolumeState.MUTED) {
	  this.unmute();
	} else {
	  this.mute();
	}
  }

  public seek(time: number): void {
	if (this.getDuration() > time) {
	  this._currentAudio.setCurrentTime(time);
	}
  }

  public getDuration(): number {
	return this._currentAudio.getDuration();
  }

  public getCurrentTime(): number {
	return this._currentAudio.getCurrentTime();
  }

  public getBuffer(): number {
	return this._currentAudio.getBuffer();
  }

  public getTimeData(): TimeState {
	return this._currentAudio.getTimeData();
  }

  protected _initializeCore(): void {
	this.mediaSession?.setPlaybackState('none');

	this.on('ready', this.handleReady.bind(this));

	this.on('play', this.handlePlay.bind(this));

	this.on('pause', this.handlePause.bind(this));

	this.on('song', this.handleCurrentSongChange.bind(this));

	this.on('time', this.handleTimeUpdate.bind(this));

	this.on('error', this.handleError.bind(this));

	this.setVolume(
	  parseInt(localStorage.getItem('nmplayer-music-volume') ?? '100', 10)
	);

	setTimeout(() => {
	  this.emit('ready');
	}, 1500);
  }

  private handleReady(): void {
	this.mediaSession?.setActionHandler({
	  play: this.play.bind(this),
	  pause: this.pause.bind(this),
	  stop: this.stop.bind(this),
	  previous: this.previous.bind(this),
	  next: this.next.bind(this),
	  seek: this.seek.bind(this),
	  getPosition: this.getCurrentTime.bind(this),
	});
  }

  private handlePlay(): void {
	this.isPlaying = true;
	this.state = PlayerState.PLAYING;

	this.mediaSession?.setPlaybackState('playing');
  }

  private handlePause(): void {
	this.isPlaying = false;
	this.state = PlayerState.PAUSED;

	this.mediaSession?.setPlaybackState('paused');
  }

  private handleCurrentSongChange(value: BasePlaylistItem | null): void {
	if (!value) {
	  this.currentSong = null;
	  this.mediaSession?.setPlaybackState('none');

	  return;
	}

	const feat = this.currentSong?.artist_track
	  ?.slice(1)
	  ?.map((a) => ` Ft. ${a.name}`)
	  .join('');

	if (window.location.hash.includes('music')) {
	  this.setTitle(
		`${this.currentSong?.artist_track?.[0]?.name} - ${this.currentSong?.name} ${feat}`,
	  );
	}

	this.mediaSession?.setMetadata({
	  title: `${this.currentSong?.name}`,
	  artist: `${this.currentSong?.artist_track?.[0]?.name} ${feat}`,
	  album: this.currentSong?.album_track?.[0]?.name ?? '',
	  artwork: this.currentSong?.cover ? `${this.baseUrl}${this.currentSong?.cover}` : undefined,
	});
  }

  private handleTimeUpdate(data: TimeState): void {
	const feat = this.currentSong?.artist_track
	  ?.slice(1)
	  ?.map((a) => ` Ft. ${a.name}`)
	  .join('');

	if (window.location.hash.includes('music')) {
	  this.setTitle(
		`${this.currentSong?.artist_track?.[0]?.name} - ${this.currentSong?.name} ${feat}`,
	  );
	}

	if (!data.duration) return;

	this.mediaSession?.setPositionState({
	  position: data.position,
	  duration: data.duration,
	  playbackRate: this._currentAudio.getPlaybackRate(),
	});
  }

  private handleError(): void {
	this.state = PlayerState.ERROR;
	this.isPlaying = false;

	this.mediaSession?.setPlaybackState('none');
  }
}

export default PlayerCore;
