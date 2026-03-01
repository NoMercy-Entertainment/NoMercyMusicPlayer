"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("@ionic/vue");
const hls_js_1 = __importDefault(require("hls.js"));
const state_1 = require("./state");
const spectrumAnalyzer_1 = require("./spectrumAnalyzer");
class AudioNode {
    constructor(options, parent) {
        this._audioElement = {};
        this.state = state_1.PlayerState.STOPPED;
        this.duration = 0;
        this.currentTime = 0;
        this.volume = 100;
        this.isFading = false;
        this.isFadingOut = false;
        this.context = null;
        this.motion = null;
        this.options = {};
        this.motionColors = [
            "#ff0000",
            "#ffff00",
            "#00ff00",
            "#00ffff",
            "#0000ff",
            "#ff00ff",
            "#ff0000",
        ];
        this.fadeDuration = 3;
        this.prefetchLeeway = 10;
        this.crossFadeSteps = 20;
        this.fadeOutVolume = 0;
        this.fadeInVolume = 100;
        this.hasNextQueued = false;
        this.nextSongFired = false;
        this.repeat = "off";
        this._disableAutoPlayback = false;
        this._lastSuppressedLog = 0;
        // Android TV
        this.isTv = window.matchMedia("(width: 960px) and (height: 540px)")
            .matches;
        this.bands = [];
        this._preGain = null;
        this._filters = [];
        this._panner = null;
        this.options = options;
        this.parent = parent;
        this.tag = `AudioNode[${options.id}]`;
        this.prefetchLeeway = options.prefetchLeeway ?? 10;
        this.fadeDuration = options.fadeDuration ?? 3;
        this.bands = options.bands;
        this.motionConfig = options.motionConfig;
        this.motionColors = options.motionColors;
        this._initialize();
    }
    log(message) {
        this.parent._log(this.tag, message);
    }
    dispose() {
        this._removeEvents();
        this._audioElement.remove();
    }
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }
    setSource(url) {
        this.log(`setSource: autoplay=${this._audioElement.autoplay}, isFading=${this.isFading}, isFadingOut=${this.isFadingOut}`);
        this._audioElement.pause();
        this._audioElement.removeAttribute("src");
        if (!url.endsWith(".m3u8")) {
            this.hls?.destroy();
            this.hls = undefined;
            this._audioElement.src = `${url}${this.accessToken ? `?token=${this.accessToken}` : ""}`;
        }
        else if (hls_js_1.default.isSupported()) {
            this.hls ?? (this.hls = new hls_js_1.default({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferHole: 0,
                maxBufferLength: 30,
                maxBufferSize: 0,
                autoStartLoad: true,
                testBandwidth: true,
                xhrSetup: (xhr) => {
                    if (this.accessToken) {
                        xhr.setRequestHeader("authorization", `Bearer ${this.accessToken}`);
                    }
                },
            }));
            this.hls?.loadSource(url);
            this.hls?.attachMedia(this._audioElement);
        }
        else if (this._audioElement.canPlayType("application/vnd.apple.mpegurl")) {
            this._audioElement.src = `${url}${this.accessToken ? `?token=${this.accessToken}` : ""}`;
        }
        return this;
    }
    play() {
        return this._audioElement.play();
    }
    pause() {
        this._audioElement.pause();
    }
    stop() {
        this._audioElement.pause();
        this._audioElement.currentTime = 0;
        URL.revokeObjectURL(this._audioElement.src);
        this._audioElement.removeAttribute("src");
        this._audioElement.removeAttribute("data-src");
    }
    setVolume(volume) {
        const isMobileDevice = (0, vue_1.isPlatform)("android") || (0, vue_1.isPlatform)("ios");
        if (isMobileDevice) {
            this._audioElement.volume = 1;
            return;
        }
        if (volume < 0)
            volume = 0;
        if (volume > 100)
            volume = 100;
        this.volume = volume;
        this._audioElement.volume = volume / 100;
    }
    fadeVolume(volume) {
        if (volume < 0)
            volume = 0;
        if (volume > 100)
            volume = 100;
        this._audioElement.volume = volume / 100;
    }
    getVolume() {
        return this.volume;
    }
    mute() {
        this._audioElement.muted = true;
    }
    unmute() {
        this._audioElement.muted = false;
    }
    isPlaying() {
        return this.state === state_1.PlayerState.PLAYING;
    }
    getDuration() {
        return this.duration;
    }
    getCurrentTime() {
        return this.currentTime;
    }
    getBuffer() {
        return this._audioElement.buffered.length;
    }
    getPlaybackRate() {
        return this._audioElement.playbackRate;
    }
    setCurrentTime(time) {
        this._audioElement.currentTime = time;
        return this;
    }
    getAudioElement() {
        return this._audioElement;
    }
    getTimeData() {
        return {
            position: Math.abs(this.getCurrentTime()),
            duration: Math.abs(this.getDuration()),
            remaining: this.getDuration() < 0
                ? Infinity
                : Math.abs(this.getDuration()) - Math.abs(this.getCurrentTime()),
            buffered: this.getBuffer(),
            percentage: (Math.abs(this.getCurrentTime()) / Math.abs(this.getDuration())) * 100,
        };
    }
    setCrossFadeSteps(steps) {
        this.crossFadeSteps = steps;
    }
    setAutoPlayback(value) {
        this._disableAutoPlayback = value;
    }
    _fadeIn(firstRun = false) {
        if (firstRun) {
            this.log(`_fadeIn START, volume=${this.volume}, steps=${this.crossFadeSteps}`);
            this.fadeVolume(0);
            this.fadeInVolume = 0;
            this.nextSongFired = false;
        }
        this._audioElement.play().then();
        if (this.fadeInVolume < this.volume) {
            this.fadeInVolume += this.crossFadeSteps;
            setTimeout(() => this._fadeIn(), 200);
        }
        else {
            this.fadeInVolume = this.volume;
            this.isFading = false;
            this.log(`_fadeIn COMPLETE, isFading=false`);
        }
        if (this.fadeInVolume > 100) {
            this.fadeInVolume = 100;
        }
        this.fadeVolume(this.fadeInVolume);
        if (!this.nextSongFired && this.fadeInVolume >= this.volume - this.crossFadeSteps * 12) {
            this.nextSongFired = true;
            this.log(`emitting nextSong (fadeInVol=${this.fadeInVolume})`);
            this.parent.emit("nextSong");
        }
    }
    _fadeOut(firstRun = false) {
        this.isFading = true;
        this.isFadingOut = true;
        if (firstRun) {
            this.log(`_fadeOut START, volume=${this.volume}, steps=${this.crossFadeSteps}`);
            this.fadeOutVolume = this.volume;
        }
        if (this.fadeOutVolume > 0) {
            this.fadeOutVolume -= this.crossFadeSteps;
            if (this.fadeOutVolume < 0) {
                this.fadeOutVolume = 0;
            }
            this.fadeVolume(this.fadeOutVolume);
            if (this.fadeOutVolume > 0) {
                setTimeout(() => this._fadeOut(), 200);
            }
        }
        if (this.fadeOutVolume <= 0) {
            this.fadeOutVolume = 0;
            this.fadeVolume(0);
            this.log(`_fadeOut COMPLETE, pausing + cleanup`);
            this.pause();
            URL.revokeObjectURL(this._audioElement?.src);
            this._audioElement?.removeAttribute("src");
            this._audioElement?.removeAttribute("data-src");
            this.parent.emit("endFadeOut");
            setTimeout(() => {
                this.hasNextQueued = false;
                this.isFading = false;
                this.isFadingOut = false;
                this.log(`emitting setCurrentAudio, restoring autoplay=true`);
                this._audioElement.autoplay = true;
                this.parent.emit("setCurrentAudio", this._audioElement);
            }, 500);
        }
    }
    setRepeating(repeat) {
        this.repeat = repeat;
    }
    _initialize() {
        this._createAudioElement(this.options.id);
        this._addEvents();
    }
    _createAudioElement(id) {
        this._audioElement = document.createElement("audio");
        this._audioElement.id = `audio-${id}`;
        this._audioElement.preload = "auto";
        this._audioElement.controls = false;
        this._audioElement.autoplay = true;
        this._audioElement.loop = false;
        this._audioElement.setAttribute("tabindex", "-1");
        let volume = this.options.volume ?? 100;
        if (volume < 0)
            volume = 0;
        if (volume > 100)
            volume = 100;
        this._audioElement.volume = volume / 100;
        // this._audioElement.style.display = 'none';
        this._audioElement.crossOrigin = "anonymous";
        document.body.appendChild(this._audioElement);
        return this;
    }
    playEvent() {
        this.state = state_1.PlayerState.PLAYING;
        this.parent.emit("play-internal", this._audioElement);
        this._initializeContext();
        if (!this.isFading) {
            this.parent.emit("play", this._audioElement);
        }
        else {
            this.log(`playEvent SUPPRESSED (isFading=true)`);
        }
    }
    pauseEvent() {
        this.state = state_1.PlayerState.PAUSED;
        this.parent.emit("pause-internal", this._audioElement);
        if (!this.isFading) {
            this.parent.emit("pause", this._audioElement);
        }
        else {
            this.log(`pauseEvent SUPPRESSED (isFading=true)`);
        }
    }
    endedEvent() {
        this.log(`endedEvent, isFading=${this.isFading}`);
        this.state = state_1.PlayerState.ENDED;
        this.parent.emit("ended", this._audioElement);
    }
    errorEvent() {
        console.error("Error", this._audioElement.error);
        this.state = state_1.PlayerState.ERROR;
        this.parent.emit("error", this._audioElement);
    }
    waitingEvent() {
        this.state = state_1.PlayerState.BUFFERING;
        this.parent.emit("waiting", this._audioElement);
    }
    canplayEvent() {
        this.parent.emit("canplay", this._audioElement);
        if (this.isPlaying())
            return;
        this.state = state_1.PlayerState.IDLE;
    }
    loadedmetadataEvent() {
        this.parent.emit("loadedmetadata", this._audioElement);
        if (this.isPlaying())
            return;
        this.state = state_1.PlayerState.IDLE;
    }
    loadstartEvent() {
        this.state = state_1.PlayerState.LOADING;
        this.parent.emit("loadstart", this._audioElement);
    }
    timeupdateEvent() {
        this.state = state_1.PlayerState.PLAYING;
        this.currentTime = this._audioElement.currentTime;
        this.duration = this._audioElement.duration;
        this.parent.emit("time-internal", this.getTimeData());
        if (!this.isFading || this.repeat == "one") {
            this.parent.emit("time", this.getTimeData());
        }
        else {
            const now = Date.now();
            if (now - this._lastSuppressedLog > 2000) {
                this._lastSuppressedLog = now;
                this.log(`timeupdate SUPPRESSED: pos=${this._audioElement.currentTime.toFixed(1)}, dur=${this._audioElement.duration.toFixed(1)}, isFading=${this.isFading}`);
            }
        }
        if (!this.hasNextQueued &&
            this.repeat !== "one" &&
            this._audioElement.currentTime >=
                this._audioElement.duration - this.prefetchLeeway &&
            !this._disableAutoPlayback) {
            this.hasNextQueued = true;
            this.log(`emitting queueNext (pos=${this._audioElement.currentTime.toFixed(1)}, dur=${this._audioElement.duration.toFixed(1)})`);
            this.parent.emit("queueNext");
        }
        if (this.repeat !== "one" &&
            this._audioElement.currentTime >=
                this._audioElement.duration - this.fadeDuration) {
            this.parent.emit("startFadeOut");
        }
    }
    durationchangeEvent() {
        this.duration = this._audioElement.duration;
        if (!this.isFading) {
            this.parent.emit("duration", this._audioElement.duration);
        }
    }
    volumechangeEvent() {
        this.parent.emit("volume", this.volume);
    }
    seekedEvent() {
        if (this.isFading)
            return;
        this.log(`seeked ${this._audioElement.currentTime.toFixed(2)}`);
        this.parent.emit("seeked", {
            buffered: this._audioElement.buffered.length,
            duration: this._audioElement.duration,
            percentage: (this._audioElement.currentTime / this._audioElement.duration) * 100,
            position: this._audioElement.currentTime,
            remaining: this._audioElement.duration - this._audioElement.currentTime,
        });
    }
    _addEvents() {
        this._audioElement.addEventListener("play", this.playEvent.bind(this));
        this._audioElement.addEventListener("pause", this.pauseEvent.bind(this));
        this._audioElement.addEventListener("ended", this.endedEvent.bind(this));
        this._audioElement.addEventListener("error", this.errorEvent.bind(this));
        this._audioElement.addEventListener("waiting", this.waitingEvent.bind(this));
        this._audioElement.addEventListener("canplay", this.canplayEvent.bind(this));
        this._audioElement.addEventListener("loadedmetadata", this.loadedmetadataEvent.bind(this));
        this._audioElement.addEventListener("loadstart", this.loadstartEvent.bind(this));
        this._audioElement.addEventListener("timeupdate", this.timeupdateEvent.bind(this));
        this._audioElement.addEventListener("durationchange", this.durationchangeEvent.bind(this));
        this._audioElement.addEventListener("volumechange", this.volumechangeEvent.bind(this));
        this._audioElement.addEventListener("seeked", this.seekedEvent.bind(this));
    }
    _removeEvents() {
        this._audioElement.removeEventListener("play", this.playEvent.bind(this));
        this._audioElement.removeEventListener("pause", this.pauseEvent.bind(this));
        this._audioElement.removeEventListener("ended", this.endedEvent.bind(this));
        this._audioElement.removeEventListener("error", this.errorEvent.bind(this));
        this._audioElement.removeEventListener("waiting", this.waitingEvent.bind(this));
        this._audioElement.removeEventListener("canplay", this.canplayEvent.bind(this));
        this._audioElement.removeEventListener("loadedmetadata", this.loadedmetadataEvent.bind(this));
        this._audioElement.removeEventListener("loadstart", this.loadstartEvent.bind(this));
        this._audioElement.removeEventListener("timeupdate", this.timeupdateEvent.bind(this));
        this._audioElement.removeEventListener("durationchange", this.durationchangeEvent.bind(this));
        this._audioElement.removeEventListener("volumechange", this.volumechangeEvent.bind(this));
        this._audioElement.removeEventListener("seeked", this.seekedEvent.bind(this));
    }
    createFilter(frequency, type) {
        const filter = this.context.createBiquadFilter();
        filter.frequency.value = frequency;
        filter.type = type;
        filter.gain.value = 0;
        return filter;
    }
    _initializeContext() {
        // Performance on Android TV is insufficient and causes the playback to stutter
        if (this.isTv ||
            localStorage.getItem("nmplayer-music-supports-audio-context") === "false")
            return;
        if (!this.context) {
            try {
                this.motion = (0, spectrumAnalyzer_1.spectrumAnalyser)(this._audioElement, this.motionConfig);
                if (this.motionColors.length) {
                    this.motion.registerGradient("theme", {
                        bgColor: "transparent",
                        dir: "h",
                        colorStops: this.motionColors,
                    });
                    this.motion.gradient = "theme";
                }
                setTimeout(() => {
                    this.motion.canvas.style.position = "absolute";
                    this.motion.canvas.style.height = "320px";
                    this.motion.canvas.style.width = "1400px";
                    this.motion.canvas.style.overflow = "hidden";
                    this.motion.canvas.style.opacity = "0";
                    this.motion.canvas.style.pointerEvents = "none";
                }, 500);
                this.context = this.motion.audioCtx;
                this.context.addEventListener("error", () => {
                    localStorage.setItem("nmplayer-music-supports-audio-context", "false");
                    this.context.close().then();
                    location.reload();
                });
                this._preGain = this.context.createGain();
                this._filters = this.bands
                    .slice(1) // Skip the first band (it's the pre-gain)
                    .map((band) => this.createFilter(band.frequency, "peaking"));
                this._panner = this.context.createStereoPanner();
                const track1 = this.motion.connectedSources.at(0);
                track1.connect(this._preGain);
                this._filters
                    .reduce((prev, curr) => {
                    // noinspection CommaExpressionJS
                    return prev.connect(curr), curr;
                }, this._preGain)
                    .connect(this._panner)
                    .connect(this.context.destination);
                this.parent.on("setPreGain", (gain) => {
                    this._preGain.gain.value = gain;
                });
                this.parent.on("setPanner", (pan) => {
                    this._panner.pan.value = pan;
                });
                this.parent.on("setFilter", (band) => {
                    const index = this.bands.findIndex((b) => b.frequency === band.frequency);
                    this._filters[index - 1].gain.value = band.gain;
                });
                this.parent.loadEqualizerSettings();
            }
            catch (e) {
                console.error("Failed to create AudioContext:", e);
                return;
            }
        }
        if (this.context && this.context.state === "suspended") {
            this.context
                .resume()
                .then(() => {
                this.log("AudioContext resumed");
            })
                .catch((e) => {
                console.error("Failed to resume AudioContext:", e);
            });
        }
    }
}
exports.default = AudioNode;
