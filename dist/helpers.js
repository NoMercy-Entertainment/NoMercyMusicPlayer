"use strict";
// noinspection JSUnusedGlobalSymbols
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audioNode_1 = __importDefault(require("./audioNode"));
const state_1 = require("./state");
const equalizer_1 = require("./equalizer");
class Helpers extends EventTarget {
    constructor() {
        super();
        this.volume = Number(localStorage.getItem('nmplayer-music-volume')) || 100;
        this.muted = false;
        this.duration = 0;
        this.currentTime = 0;
        this.buffered = 0;
        this.playbackRate = 1;
        this.fadeDuration = 3;
        this.currentSong = null;
        this.state = state_1.PlayerState.IDLE;
        this.volumeState = state_1.VolumeState.UNMUTED;
        this.isShuffling = false;
        this.isRepeating = false;
        this.isMuted = false;
        this.isPaused = false;
        this.isPlaying = false;
        this.isStopped = false;
        this.isSeeking = false;
        this.isTransitioning = false;
        this.newSourceLoaded = false;
        this.baseUrl = '';
        this.accessToken = '';
        this._options = {};
        this.context = null;
        this.preGain = null;
        this.filters = [];
        this.panner = null;
        this.siteTitle = 'NoMercy Player';
        this.motionConfig = {
            alphaBars: true,
            ansiBands: true,
            barSpace: 0.25,
            bgAlpha: 0,
            channelLayout: "dual-horizontal",
            colorMode: "bar-level",
            fadePeaks: false,
            fftSize: 16384,
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
        };
        this.motionColors = [];
        this.equalizerPanning = 0;
        this._audioElement1 = new audioNode_1.default({
            id: 1,
            volume: this.volume / 100,
            bands: equalizer_1.equalizerBands,
            motionConfig: this.motionConfig,
            motionColors: this.motionColors
        }, this);
        this._audioElement2 = new audioNode_1.default({
            id: 2,
            volume: this.volume / 100,
            bands: equalizer_1.equalizerBands,
            motionConfig: this.motionConfig,
            motionColors: this.motionColors
        }, this);
        this._currentAudio = this._audioElement1;
        this._nextAudio = this._audioElement2;
        this.equalizerBands = equalizer_1.equalizerBands;
        this.equalizerSliderValues = equalizer_1.equalizerSliderValues;
        this.equalizerPresets = equalizer_1.equalizerPresets;
        this._audioElement1.context = this.context;
        this._audioElement1._preGain = this.preGain;
        this._audioElement1._filters = this.filters;
        this._audioElement1._panner = this.panner;
        this._audioElement2.context = this.context;
        this._audioElement2._preGain = this.preGain;
        this._audioElement2._filters = this.filters;
        this._audioElement2._panner = this.panner;
    }
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }
    setBaseUrl(serverLocation) {
        this.baseUrl = serverLocation;
    }
    getNewSource(newItem) {
        if (!newItem?.folder)
            return Promise.resolve('');
        return new Promise((resolve) => {
            return resolve(encodeURI(`${this.baseUrl}/${newItem?.folder_id}${newItem?.folder}${newItem?.filename}?token=${this.accessToken}`).replace(/#/u, '%23'));
        });
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
                this?.setFilter(band);
            }
        }
    }
    setPreGain(gain) {
        this.emit('setPreGain', gain);
    }
    setPanner(pan) {
        this.equalizerPanning = pan;
        this.emit('setPanner', pan);
    }
    setFilter(filter) {
        this.emit('setFilter', filter);
    }
    saveEqualizerSettings() {
        localStorage.setItem('nmplayer-music-equalizer-settings', JSON.stringify(this.equalizerBands));
    }
    setTitle(arg) {
        if (!arg || arg == '') {
            document.title = this.siteTitle;
            return;
        }
        const res = [];
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
    emit(event, data) {
        if (!data || typeof data === 'string') {
            data = data ?? '';
        }
        else if (typeof data === 'object') {
            data = { ...(data ?? {}) };
        }
        this.dispatchEvent?.(new CustomEvent(event, {
            detail: data,
        }));
    }
    on(event, callback) {
        this.addEventListener(event, (e) => callback(e.detail));
    }
    off(event, callback) {
        this.removeEventListener(event, (e) => callback(e.detail));
    }
    once(event, callback) {
        this.addEventListener(event, (e) => callback(e.detail), { once: true });
    }
}
exports.default = Helpers;
