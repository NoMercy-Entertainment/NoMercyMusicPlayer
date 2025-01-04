import AudioMotionAnalyzer, {ConstructorOptions} from 'audiomotion-analyzer';

const spectrumAnalyser = (audio: HTMLAudioElement, config?: ConstructorOptions) => new AudioMotionAnalyzer({
	source: audio,
	...config,
  }
);

export {
  AudioMotionAnalyzer,
  type ConstructorOptions,
  spectrumAnalyser
};
