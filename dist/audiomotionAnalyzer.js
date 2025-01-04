"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioMotionAnalyzer = exports.audioMotion = void 0;
const audiomotion_analyzer_1 = __importDefault(require("audiomotion-analyzer"));
exports.AudioMotionAnalyzer = audiomotion_analyzer_1.default;
const audioMotion = (audio, config) => new audiomotion_analyzer_1.default({
    source: audio,
    ...config,
});
exports.audioMotion = audioMotion;
