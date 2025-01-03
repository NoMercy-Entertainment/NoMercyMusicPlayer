"use strict";
// noinspection JSUnusedGlobalSymbols
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const media_session_1 = __importDefault(require("@nomercy-entertainment/media-session"));
const queue_1 = __importDefault(require("./queue"));
const state_1 = require("./state");
class PlayerCore extends queue_1.default {
    constructor() {
        super();
        this._initializeCore();
        window.musicPlayer = this;
        this.mediaSession = new media_session_1.default();
    }
    setSiteTitle(title) {
        this.siteTitle = title;
    }
    dispose() {
        this._audioElement1.dispose();
        this._audioElement2.dispose();
        this.mediaSession?.setPlaybackState('none');
    }
    play() {
        return this._currentAudio.play();
    }
    pause() {
        this._currentAudio.pause();
    }
    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        }
        else {
            this.play().then();
        }
    }
    stop() {
        this._currentAudio.stop();
        this.currentSong = null;
        this.state = state_1.PlayerState.STOPPED;
        this.emit('song', null);
        this.emit('stop');
        this.setQueue([]);
        this.dispose();
        this.mediaSession?.setPlaybackState('none');
    }
    setVolume(volume) {
        const newVolume = Math.floor(volume);
        this._currentAudio.setVolume(newVolume);
        this._nextAudio.setVolume(newVolume);
        localStorage.setItem('nmplayer-music-volume', newVolume.toString());
    }
    getVolume() {
        return this._currentAudio.getVolume();
    }
    mute() {
        this._currentAudio.mute();
        this._nextAudio.mute();
        this.volumeState = state_1.VolumeState.MUTED;
        this.isMuted = true;
        this.emit('mute', true);
        localStorage.setItem('nmplayer-music-muted', 'true');
    }
    unmute() {
        this._currentAudio.unmute();
        this._nextAudio.unmute();
        this.volumeState = state_1.VolumeState.UNMUTED;
        this.isMuted = false;
        this.emit('mute', false);
        localStorage.setItem('nmplayer-music-muted', 'false');
    }
    toggleMute() {
        if (this.volumeState === state_1.VolumeState.MUTED) {
            this.unmute();
        }
        else {
            this.mute();
        }
    }
    seek(time) {
        if (this.getDuration() > time) {
            this._currentAudio.setCurrentTime(time);
        }
    }
    getDuration() {
        return this._currentAudio.getDuration();
    }
    getCurrentTime() {
        return this._currentAudio.getCurrentTime();
    }
    getBuffer() {
        return this._currentAudio.getBuffer();
    }
    getTimeData() {
        return this._currentAudio.getTimeData();
    }
    _initializeCore() {
        this.mediaSession?.setPlaybackState('none');
        this.on('ready', this.handleReady.bind(this));
        this.on('play', this.handlePlay.bind(this));
        this.on('pause', this.handlePause.bind(this));
        // @ts-ignore
        this.on('song', this.handleCurrentSongChange.bind(this));
        this.on('time', this.handleTimeUpdate.bind(this));
        this.on('error', this.handleError.bind(this));
        this.setVolume(parseInt(localStorage.getItem('nmplayer-music-volume') ?? '100', 10));
        setTimeout(() => {
            this.emit('ready');
        }, 1500);
    }
    handleReady() {
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
    handlePlay() {
        this.isPlaying = true;
        this.state = state_1.PlayerState.PLAYING;
        this.mediaSession?.setPlaybackState('playing');
    }
    handlePause() {
        this.isPlaying = false;
        this.state = state_1.PlayerState.PAUSED;
        this.mediaSession?.setPlaybackState('paused');
    }
    handleCurrentSongChange(value) {
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
            this.setTitle(`${this.currentSong?.artist_track?.[0]?.name} - ${this.currentSong?.name} ${feat}`);
        }
        this.mediaSession?.setMetadata({
            title: `${this.currentSong?.name}`,
            artist: `${this.currentSong?.artist_track?.[0]?.name} ${feat}`,
            album: this.currentSong?.album_track?.[0]?.name ?? '',
            artwork: this.currentSong?.cover ? `${this.serverLocation}/images/music${this.currentSong?.cover}` : undefined,
        });
    }
    handleTimeUpdate(data) {
        const feat = this.currentSong?.artist_track
            ?.slice(1)
            ?.map((a) => ` Ft. ${a.name}`)
            .join('');
        if (window.location.hash.includes('music')) {
            this.setTitle(`${this.currentSong?.artist_track?.[0]?.name} - ${this.currentSong?.name} ${feat}`);
        }
        if (!data.duration)
            return;
        this.mediaSession?.setPositionState({
            position: data.position,
            duration: data.duration,
            playbackRate: this._currentAudio.getPlaybackRate(),
        });
    }
    handleError() {
        this.state = state_1.PlayerState.ERROR;
        this.isPlaying = false;
        this.mediaSession?.setPlaybackState('none');
    }
}
exports.default = PlayerCore;