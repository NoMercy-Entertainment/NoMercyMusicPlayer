// noinspection JSUnusedGlobalSymbols

import Helpers from './helpers';

import type {IsShuffling, RepeatState, BasePlaylistItem} from './types';

export default class Queue<S extends BasePlaylistItem> extends Helpers<S> {
    public currentSong: S | null = null;

    protected _repeat: RepeatState = 'off';
    protected _queue: Array<S> = [];
    protected _backLog: Array<S> = [];
    protected _shuffle: IsShuffling = false;

    constructor() {
        super();

        this._initializeQueue();
    }

    public getQueue(): Array<S> {
        return this._queue
    }

    public setQueue(payload: Array<S>) {
        this._queue = [...payload].map((item) => Object.assign({}, item));
        this.emit('queue', this._queue)
    }

    public addToQueue(payload: S) {
        this._queue.push(Object.assign({}, payload));
        this.emit('queue', this._queue)
    }

    public pushToQueue(payload: S[]) {
        payload = Object.assign({}, payload)
        payload.forEach((song) => this._queue.push(song));
        this.emit('queue', this._queue)
    }

    public removeFromQueue(payload: S) {
        this._queue.splice(this._queue.indexOf(payload), 1);
        this.emit('queue', this._queue)
    }

    public addToQueueNext(payload: S) {
        this._queue.unshift(Object.assign({}, payload));
        this.emit('queue', this._queue)
    }

    public getBackLog(): Array<S> {
        return this._backLog;
    }

    public setBackLog(payload: Array<S>) {
        this._backLog = [...payload].map((item) => Object.assign({}, item));
        this.emit('backlog', this._backLog)
    }

    public addToBackLog(payload: S | null) {
        if (!payload) return;
        this._backLog.push(Object.assign({}, payload));
        this.emit('backlog', this._backLog)
    }

    public pushToBackLog(payload: S[]) {
        payload = Object.assign({}, payload)
        payload.forEach((song) => this._backLog.push(song));
        this.emit('backlog', this._backLog)
    }

    public removeFromBackLog(payload: S) {
        this._backLog.splice(this._backLog.indexOf(payload), 1);
        this.emit('backlog', this._backLog)
    }

    public setCurrentSong(payload: S | null) {
        this.currentSong = payload;

        this.emit('song', payload);

        if (!payload) return;

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

    public next() {
        this.addToBackLog(this.currentSong);

        if (this._queue?.length > 0) {
            let nexItem = this._queue[0];

            if (this._shuffle) {
                const index = Math.round(
                    Math.random() * (this._queue.length - 1)
                );
                nexItem = this._queue[index];
            }

            this.setCurrentSong(nexItem);
            this.removeFromQueue(nexItem);
        } else {
            // TODO: find new items to play

            this.setCurrentSong(this._backLog[0]);
            this.setQueue(this._backLog.slice(1));

            this.setBackLog([]);
        }
    }

    public previous() {
        if (this._currentAudio.currentTime > 3) {
            this._currentAudio.setCurrentTime(0);
        } else if (this._backLog.length > 0) {
            const prevSong = this._backLog.at(-1);

            if (!prevSong) return;

            if (this.currentSong) {
                this.addToQueueNext(this.currentSong);
            }

            this.setCurrentSong(prevSong);

            this.removeFromBackLog(prevSong);
        } else {
            this._currentAudio.setCurrentTime(0);
        }
    }

    public playTrack(track: S, tracks?: S[]) {
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

    public shuffle(value: IsShuffling) {
        this._shuffle = value;
        this.isShuffling = value;
        this.emit('shuffle', value);
    }

    public repeat(value: RepeatState) {
        this._repeat = value;
        this.emit('repeat', this._repeat);
        this.isRepeating = this._repeat !== 'off';

        this._currentAudio.setRepeating(this._repeat);
        this._nextAudio.setRepeating(this._repeat);
    }

    protected _initializeQueue(): void {

        this.on('ended', () => {
            if (this.disableAutoPlayback) return;
            if (this._repeat === 'one') {
                this._currentAudio.setCurrentTime(0);
                setTimeout(() => {
                    this._currentAudio.play().then();
                }, 150);
            }
        });

        this.on('queueNext', () => {
            if (this.disableAutoPlayback) return;
            if (this._repeat === 'one') return;

            if (this._repeat === 'all' && this._queue.length === 0) {
                this.setQueue(this._backLog);
                this.setBackLog([]);
            }

            if (this._queue.length == 0) return;

            const currentVolume = this.volume;

            this.getNewSource(this._queue[0])
                .then((src) => {
                    this._currentAudio.isFading = true;
                    this._nextAudio.setSource(src);
                    this._nextAudio.fadeVolume(0);
                    this.once('startFadeOut', () => {
                        if (this._repeat === 'one') return;

                        this._currentAudio.setCrossFadeSteps(
                            currentVolume / this.fadeDuration / 5
                        );
                        this._currentAudio._fadeOut(true);

                        this._nextAudio.setCrossFadeSteps(
                            currentVolume / this.fadeDuration / 5
                        );
                        this._nextAudio._fadeIn(true);

                        this.once('nextSong', () => {
                            if (this._repeat === 'one') return;

                            const nexItem = this._queue[0];

                            this.addToBackLog(this.currentSong);

                            this.currentSong = nexItem;

                            this.removeFromQueue(nexItem);

                            this.emit('song', nexItem);

                            this.once('setCurrentAudio', () => {
                                if (this._repeat == 'one') return;
                                this._currentAudio.isFading = false;

                                this._currentAudio = this._nextAudio;

                                this._nextAudio =
                                    this._currentAudio == this._audioElement1
                                        ? this._audioElement2
                                        : this._audioElement1;
                            });
                        });
                    });
                })
                .catch((err) => {
                    console.log(err);
                    this.currentSong = null;
                });
        });

        this.on('ended', (el) => {
            if (this.disableAutoPlayback) return;
            if (el == this._currentAudio.getAudioElement()) {
                this.currentSong = null;
            }
        });

        this.on('error', this.next.bind(this));
    }
}
