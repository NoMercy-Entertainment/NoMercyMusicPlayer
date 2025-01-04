import AudioMotionAnalyzer, { ConstructorOptions } from 'audiomotion-analyzer';
declare const spectrumAnalyser: (audio: HTMLAudioElement, config?: ConstructorOptions) => AudioMotionAnalyzer;
export { AudioMotionAnalyzer, type ConstructorOptions, spectrumAnalyser };
