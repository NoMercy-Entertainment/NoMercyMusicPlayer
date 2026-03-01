"use strict";
// noinspection JSUnusedGlobalSymbols
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("./helpers"));
class Queue extends helpers_1.default {
    constructor() {
        super();
        this.currentSong = null;
        this._repeat = 'off';
        this._queue = [];
        this._backLog = [];
        this._shuffle = false;
        this.tag = 'Queue';
        this._initializeQueue();
    }
    log(message) {
        this._log(this.tag, message);
    }
    getQueue() {
        return this._queue;
    }
    setQueue(payload) {
        this._queue = [...payload].map((item) => Object.assign({}, item));
        this.emit('queue', this._queue);
    }
    addToQueue(payload) {
        this._queue.push(Object.assign({}, payload));
        this.emit('queue', this._queue);
    }
    pushToQueue(payload) {
        payload = Object.assign({}, payload);
        payload.forEach((song) => this._queue.push(song));
        this.emit('queue', this._queue);
    }
    removeFromQueue(payload) {
        this._queue.splice(this._queue.indexOf(payload), 1);
        this.emit('queue', this._queue);
    }
    addToQueueNext(payload) {
        this._queue.unshift(Object.assign({}, payload));
        this.emit('queue', this._queue);
    }
    getBackLog() {
        return this._backLog;
    }
    setBackLog(payload) {
        this._backLog = [...payload].map((item) => Object.assign({}, item));
        this.emit('backlog', this._backLog);
    }
    addToBackLog(payload) {
        if (!payload)
            return;
        this._backLog.push(Object.assign({}, payload));
        this.emit('backlog', this._backLog);
    }
    pushToBackLog(payload) {
        payload = Object.assign({}, payload);
        payload.forEach((song) => this._backLog.push(song));
        this.emit('backlog', this._backLog);
    }
    removeFromBackLog(payload) {
        this._backLog.splice(this._backLog.indexOf(payload), 1);
        this.emit('backlog', this._backLog);
    }
    setCurrentSong(payload) {
        this.log(`setCurrentSong: '${payload?.name ?? 'null'}'`);
        this.currentSong = payload;
        this.emit('song', payload);
        if (!payload)
            return;
        this.getNewSource(payload)
            .then((src) => {
            this._currentAudio.setSource(src);
            this._currentAudio.play()
                .then(() => {
                this._currentAudio
                    .getAudioElement()
                    .setAttribute('data-src', payload?.id?.toString());
            });
        });
    }
    next() {
        this.addToBackLog(this.currentSong);
        if (this._queue?.length > 0) {
            let nexItem = this._queue[0];
            if (this._shuffle) {
                const index = Math.round(Math.random() * (this._queue.length - 1));
                nexItem = this._queue[index];
            }
            this.setCurrentSong(nexItem);
            this.removeFromQueue(nexItem);
        }
        else {
            // TODO: find new items to play
            this.setCurrentSong(this._backLog[0]);
            this.setQueue(this._backLog.slice(1));
            this.setBackLog([]);
        }
    }
    previous() {
        if (this._currentAudio.currentTime > 3) {
            this._currentAudio.setCurrentTime(0);
        }
        else if (this._backLog.length > 0) {
            const prevSong = this._backLog.at(-1);
            if (!prevSong)
                return;
            if (this.currentSong) {
                this.addToQueueNext(this.currentSong);
            }
            this.setCurrentSong(prevSong);
            this.removeFromBackLog(prevSong);
        }
        else {
            this._currentAudio.setCurrentTime(0);
        }
    }
    playTrack(track, tracks) {
        if (!this.currentSong?.id || this.currentSong?.id !== track?.id) {
            this.setCurrentSong(track);
        }
        if (tracks) {
            const index = tracks.findIndex((t) => t.id === track.id);
            if (index !== -1) {
                const afterIndex = tracks.slice(index + 1);
                const beforeIndex = tracks.slice(0, index);
                const uniqueQueue = [...afterIndex, ...beforeIndex];
                this.setQueue(uniqueQueue);
            }
        }
    }
    shuffle(value) {
        this._shuffle = value;
        this.isShuffling = value;
        this.emit('shuffle', value);
    }
    /**
     * Server-driven crossfade: load the next track into the secondary audio node
     * so crossfade can begin when startFadeOut fires.
     */
    prepareCrossfade(item) {
        if (this._repeat === 'one')
            return;
        if (this._crossfadePrepared)
            return;
        const target = item ?? this._queue[0];
        if (!target)
            return;
        this._crossfadePrepared = true;
        const currentVolume = this.volume;
        this.log(`prepareCrossfade: '${target?.name}', currentSong='${this.currentSong?.name}', volume=${currentVolume}`);
        this.getNewSource(target)
            .then((src) => {
            this._currentAudio.hasNextQueued = true;
            this._nextAudio.isFading = true;
            // Disable autoplay to prevent silent background playback during preparation
            this._nextAudio.getAudioElement().autoplay = false;
            this.log(`prepareCrossfade: source loaded, nextAudio.autoplay=false`);
            this._nextAudio.setSource(src);
            this._nextAudio.fadeVolume(0);
            this.once('startFadeOut', () => {
                if (this._repeat === 'one')
                    return;
                this.log(`prepareCrossfade: startFadeOut fired, beginning ${this.fadeDuration}s crossfade`);
                this._currentAudio.isFading = true;
                this._nextAudio.isFading = true;
                this._currentAudio.setCrossFadeSteps(currentVolume / this.fadeDuration / 5);
                this._currentAudio._fadeOut(true);
                this._nextAudio.setCrossFadeSteps(currentVolume / this.fadeDuration / 5);
                this._nextAudio._fadeIn(true);
                this.once('nextSong', () => {
                    if (this._repeat === 'one')
                        return;
                    this.log(`prepareCrossfade: nextSong fired, switching to '${target?.name}', nextAudio.currentTime=${this._nextAudio.currentTime.toFixed(1)}`);
                    this.addToBackLog(this.currentSong);
                    this.currentSong = target;
                    this.removeFromQueue(target);
                    this._nextAudio.isFading = false;
                    this.emit('song', target);
                    this.once('setCurrentAudio', () => {
                        if (this._repeat == 'one')
                            return;
                        this.log(`prepareCrossfade: setCurrentAudio, swapping nodes`);
                        this._currentAudio.isFading = false;
                        this._currentAudio = this._nextAudio;
                        this._nextAudio =
                            this._currentAudio == this._audioElement1
                                ? this._audioElement2
                                : this._audioElement1;
                        // Restore autoplay on new current node
                        this._currentAudio.getAudioElement().autoplay = true;
                        this._crossfadePrepared = false;
                    });
                });
            });
        })
            .catch((err) => {
            this._crossfadePrepared = false;
            console.error('prepareCrossfade error:', err);
        });
    }
    repeat(value) {
        this._repeat = value;
        this.emit('repeat', this._repeat);
        this.isRepeating = this._repeat !== 'off';
        this._currentAudio.setRepeating(this._repeat);
        this._nextAudio.setRepeating(this._repeat);
    }
    _initializeQueue() {
        // Fallback: if no prepareCrossfade was called (e.g., server didn't send the signal),
        // trigger a local crossfade when startFadeOut fires and the queue has tracks.
        this.on('startFadeOut', () => {
            if (!this._crossfadePrepared && this._queue.length > 0) {
                this.prepareCrossfade();
            }
        });
        this.on('ended', () => {
            if (this.disableAutoPlayback)
                return;
            if (this._repeat === 'one') {
                this._currentAudio.setCurrentTime(0);
                setTimeout(() => {
                    this._currentAudio.play().then();
                }, 150);
            }
        });
        this.on('queueNext', () => {
            if (this.disableAutoPlayback)
                return;
            if (this._repeat === 'one')
                return;
            if (this._repeat === 'all' && this._queue.length === 0) {
                this.setQueue(this._backLog);
                this.setBackLog([]);
            }
            if (this._queue.length == 0)
                return;
            const currentVolume = this.volume;
            const nextTrack = this._queue[0];
            this.log(`queueNext: pre-loading '${nextTrack?.name}', volume=${currentVolume}`);
            this.getNewSource(nextTrack)
                .then((src) => {
                this._crossfadePrepared = true;
                this._nextAudio.isFading = true;
                // Disable autoplay to prevent silent background playback during preparation
                this._nextAudio.getAudioElement().autoplay = false;
                this.log(`queueNext: source loaded, nextAudio.autoplay=false`);
                this._nextAudio.setSource(src);
                this._nextAudio.fadeVolume(0);
                this.once('startFadeOut', () => {
                    if (this._repeat === 'one')
                        return;
                    this.log(`queueNext: startFadeOut fired, beginning ${this.fadeDuration}s crossfade`);
                    this._currentAudio.isFading = true;
                    this._nextAudio.isFading = true;
                    this._currentAudio.setCrossFadeSteps(currentVolume / this.fadeDuration / 5);
                    this._currentAudio._fadeOut(true);
                    this._nextAudio.setCrossFadeSteps(currentVolume / this.fadeDuration / 5);
                    this._nextAudio._fadeIn(true);
                    this.once('nextSong', () => {
                        if (this._repeat === 'one')
                            return;
                        const nexItem = this._queue[0];
                        this.log(`queueNext: nextSong fired, switching to '${nexItem?.name}', nextAudio.currentTime=${this._nextAudio.currentTime.toFixed(1)}`);
                        this.addToBackLog(this.currentSong);
                        this.currentSong = nexItem;
                        this.removeFromQueue(nexItem);
                        this._nextAudio.isFading = false;
                        this.emit('song', nexItem);
                        this.once('setCurrentAudio', () => {
                            if (this._repeat == 'one')
                                return;
                            this.log(`queueNext: setCurrentAudio, swapping nodes`);
                            this._currentAudio.isFading = false;
                            this._currentAudio = this._nextAudio;
                            this._nextAudio =
                                this._currentAudio == this._audioElement1
                                    ? this._audioElement2
                                    : this._audioElement1;
                            // Restore autoplay on new current node
                            this._currentAudio.getAudioElement().autoplay = true;
                            this._crossfadePrepared = false;
                        });
                    });
                });
            })
                .catch((err) => {
                this._crossfadePrepared = false;
                console.error('queueNext error:', err);
                this.currentSong = null;
            });
        });
        this.on('ended', (el) => {
            if (this.disableAutoPlayback)
                return;
            if (el == this._currentAudio.getAudioElement() && !this._currentAudio.isFading) {
                this.log(`ended: clearing currentSong (not fading)`);
                this.currentSong = null;
            }
            else {
                this.log(`ended: SKIPPED clear (isFading=${this._currentAudio.isFading}, isCurrentEl=${el == this._currentAudio.getAudioElement()})`);
            }
        });
        this.on('error', this.next.bind(this));
    }
}
exports.default = Queue;
