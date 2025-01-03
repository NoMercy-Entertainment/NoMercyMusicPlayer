import AudioMotionAnalyzer from 'audiomotion-analyzer';

export const audioMotion = (audio1: HTMLAudioElement) => new AudioMotionAnalyzer({
		source: audio1,
		canvas: document.getElementById('visualizer') as HTMLCanvasElement,
		alphaBars: true,
		ansiBands: true,
		barSpace: 0.25,
		bgAlpha: 0,
		channelLayout: "dual-horizontal",
		colorMode: "bar-level",
		fadePeaks: false,
		fftSize: 16_384,
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
	}
);

export { AudioMotionAnalyzer };