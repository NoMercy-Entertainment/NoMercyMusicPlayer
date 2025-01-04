import AudioMotionAnalyzer, {ConstructorOptions} from 'audiomotion-analyzer';

export const audioMotion = (audio: HTMLAudioElement, config?: ConstructorOptions) => new AudioMotionAnalyzer({
	source: audio,
	...config,
  }
);

export {
  AudioMotionAnalyzer
};
