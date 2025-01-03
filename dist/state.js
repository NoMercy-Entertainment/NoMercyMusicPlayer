"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeState = exports.PlayerState = void 0;
var PlayerState;
(function (PlayerState) {
    PlayerState["PLAYING"] = "PLAYING";
    PlayerState["PAUSED"] = "PAUSED";
    PlayerState["STOPPED"] = "STOPPED";
    PlayerState["ENDED"] = "ENDED";
    PlayerState["LOADING"] = "LOADING";
    PlayerState["ERROR"] = "ERROR";
    PlayerState["IDLE"] = "IDLE";
    PlayerState["BUFFERING"] = "BUFFERING";
})(PlayerState || (exports.PlayerState = PlayerState = {}));
var VolumeState;
(function (VolumeState) {
    VolumeState["MUTED"] = "MUTED";
    VolumeState["UNMUTED"] = "UNMUTED";
})(VolumeState || (exports.VolumeState = VolumeState = {}));
