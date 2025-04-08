"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalizerPresets = exports.equalizerBands = exports.equalizerSliderValues = void 0;
exports.equalizerSliderValues = {
    pan: {
        min: -1,
        max: 1,
        step: 0.01,
        default: 0,
    },
    pre: {
        min: -1,
        max: 3,
        step: 1,
        default: 0,
    },
    band: {
        min: -12,
        max: 12,
        step: 0.01,
        default: 0,
    },
};
exports.equalizerBands = [
    { frequency: 'Pre', gain: exports.equalizerSliderValues.pre.default },
    { frequency: 70, gain: exports.equalizerSliderValues.band.default },
    { frequency: 180, gain: exports.equalizerSliderValues.band.default },
    { frequency: 320, gain: exports.equalizerSliderValues.band.default },
    { frequency: 600, gain: exports.equalizerSliderValues.band.default },
    { frequency: 1000, gain: exports.equalizerSliderValues.band.default },
    { frequency: 3000, gain: exports.equalizerSliderValues.band.default },
    { frequency: 6000, gain: exports.equalizerSliderValues.band.default },
    { frequency: 12000, gain: exports.equalizerSliderValues.band.default },
    { frequency: 14000, gain: exports.equalizerSliderValues.band.default },
    { frequency: 16000, gain: exports.equalizerSliderValues.band.default },
];
exports.equalizerPresets = [
    {
        name: 'Custom',
        values: [
            { frequency: 70, gain: 0 },
            { frequency: 180, gain: 0 },
            { frequency: 320, gain: 0 },
            { frequency: 600, gain: 0 },
            { frequency: 1000, gain: 0 },
            { frequency: 3000, gain: 0 },
            { frequency: 6000, gain: 0 },
            { frequency: 12000, gain: 0 },
            { frequency: 14000, gain: 0 },
            { frequency: 16000, gain: 0 }
        ]
    },
    Object.freeze({
        name: "Classical",
        values: [
            Object.freeze({ frequency: 70, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 180, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 320, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 1000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 3000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 6000, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 12000, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 14000, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 16000, gain: -5.9999250009374885 })
        ]
    }),
    Object.freeze({
        name: "Club",
        values: [
            Object.freeze({ frequency: 70, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 180, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 320, gain: 2.249971875351558 }),
            Object.freeze({ frequency: 600, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 1000, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 3000, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 6000, gain: 2.249971875351558 }),
            Object.freeze({ frequency: 12000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 14000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 16000, gain: 0.37499531255859303 })
        ]
    }),
    Object.freeze({
        name: "Dance",
        values: [
            Object.freeze({ frequency: 70, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 180, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 320, gain: 1.4999812502343721 }),
            Object.freeze({ frequency: 600, gain: 0 }),
            Object.freeze({ frequency: 1000, gain: 0 }),
            Object.freeze({ frequency: 3000, gain: -3.74995312558593 }),
            Object.freeze({ frequency: 6000, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 12000, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 14000, gain: 0 }),
            Object.freeze({ frequency: 16000, gain: 0 })
        ]
    }),
    Object.freeze({
        name: "Flat",
        values: [
            Object.freeze({ frequency: 70, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 180, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 320, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 1000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 3000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 6000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 12000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 14000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 16000, gain: 0.37499531255859303 })
        ]
    }),
    Object.freeze({
        name: "Laptop speakers/headphones",
        values: [
            Object.freeze({ frequency: 70, gain: 2.9999625004687442 }),
            Object.freeze({ frequency: 180, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 320, gain: 3.374957813027337 }),
            Object.freeze({ frequency: 600, gain: -2.249971875351558 }),
            Object.freeze({ frequency: 1000, gain: -1.4999812502343721 }),
            Object.freeze({ frequency: 3000, gain: 1.124985937675779 }),
            Object.freeze({ frequency: 6000, gain: 2.9999625004687442 }),
            Object.freeze({ frequency: 12000, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 14000, gain: 7.874901563730453 }),
            Object.freeze({ frequency: 16000, gain: 8.999887501406231 })
        ]
    }),
    Object.freeze({
        name: "Large hall",
        values: [
            Object.freeze({ frequency: 70, gain: 6.374920313496081 }),
            Object.freeze({ frequency: 180, gain: 6.374920313496081 }),
            Object.freeze({ frequency: 320, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 600, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 1000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 3000, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 6000, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 12000, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 14000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 16000, gain: 0.37499531255859303 })
        ]
    }),
    Object.freeze({
        name: "Party",
        values: [
            Object.freeze({ frequency: 70, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 180, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 320, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 1000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 3000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 6000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 12000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 14000, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 16000, gain: 4.499943750703116 })
        ]
    }),
    Object.freeze({
        name: "Pop",
        values: [
            Object.freeze({ frequency: 70, gain: -1.124985937675779 }),
            Object.freeze({ frequency: 180, gain: 2.9999625004687442 }),
            Object.freeze({ frequency: 320, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 600, gain: 4.874939063261709 }),
            Object.freeze({ frequency: 1000, gain: 3.374957813027337 }),
            Object.freeze({ frequency: 3000, gain: -0.7499906251171861 }),
            Object.freeze({ frequency: 6000, gain: -1.4999812502343721 }),
            Object.freeze({ frequency: 12000, gain: -1.4999812502343721 }),
            Object.freeze({ frequency: 14000, gain: -1.124985937675779 }),
            Object.freeze({ frequency: 16000, gain: -1.124985937675779 })
        ]
    }),
    Object.freeze({
        name: "Reggae",
        values: [
            Object.freeze({ frequency: 70, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 180, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 320, gain: -0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: -3.74995312558593 }),
            Object.freeze({ frequency: 1000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 3000, gain: 4.124948438144523 }),
            Object.freeze({ frequency: 6000, gain: 4.124948438144523 }),
            Object.freeze({ frequency: 12000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 14000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 16000, gain: 0.37499531255859303 })
        ]
    }),
    Object.freeze({
        name: "Rock",
        values: [
            Object.freeze({ frequency: 70, gain: 4.874939063261709 }),
            Object.freeze({ frequency: 180, gain: 2.9999625004687442 }),
            Object.freeze({ frequency: 320, gain: -3.374957813027337 }),
            Object.freeze({ frequency: 600, gain: -4.874939063261709 }),
            Object.freeze({ frequency: 1000, gain: -2.249971875351558 }),
            Object.freeze({ frequency: 3000, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 6000, gain: 5.624929688378895 }),
            Object.freeze({ frequency: 12000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 14000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 16000, gain: 6.749915626054674 })
        ]
    }),
    Object.freeze({
        name: "Soft",
        values: [
            Object.freeze({ frequency: 70, gain: 2.9999625004687442 }),
            Object.freeze({ frequency: 180, gain: 1.124985937675779 }),
            Object.freeze({ frequency: 320, gain: -0.7499906251171861 }),
            Object.freeze({ frequency: 600, gain: -1.4999812502343721 }),
            Object.freeze({ frequency: 1000, gain: -0.7499906251171861 }),
            Object.freeze({ frequency: 3000, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 6000, gain: 5.2499343758203025 }),
            Object.freeze({ frequency: 12000, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 14000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 16000, gain: 7.49990625117186 })
        ]
    }),
    Object.freeze({
        name: "Ska",
        values: [
            Object.freeze({ frequency: 70, gain: -1.4999812502343721 }),
            Object.freeze({ frequency: 180, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 320, gain: -2.6249671879101513 }),
            Object.freeze({ frequency: 600, gain: -0.37499531255859303 }),
            Object.freeze({ frequency: 1000, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 3000, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 6000, gain: 5.624929688378895 }),
            Object.freeze({ frequency: 12000, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 14000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 16000, gain: 5.9999250009374885 })
        ]
    }),
    Object.freeze({
        name: "Full Bass",
        values: [
            Object.freeze({ frequency: 70, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 180, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 320, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 600, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 1000, gain: 1.124985937675779 }),
            Object.freeze({ frequency: 3000, gain: -2.6249671879101513 }),
            Object.freeze({ frequency: 6000, gain: -5.2499343758203025 }),
            Object.freeze({ frequency: 12000, gain: -6.374920313496081 }),
            Object.freeze({ frequency: 14000, gain: -6.749915626054674 }),
            Object.freeze({ frequency: 16000, gain: -6.749915626054674 })
        ]
    }),
    Object.freeze({
        name: "Soft Rock",
        values: [
            Object.freeze({ frequency: 70, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 180, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 320, gain: 1.4999812502343721 }),
            Object.freeze({ frequency: 600, gain: -0.37499531255859303 }),
            Object.freeze({ frequency: 1000, gain: -2.6249671879101513 }),
            Object.freeze({ frequency: 3000, gain: -3.374957813027337 }),
            Object.freeze({ frequency: 6000, gain: -2.249971875351558 }),
            Object.freeze({ frequency: 12000, gain: -0.37499531255859303 }),
            Object.freeze({ frequency: 14000, gain: 1.874976562792965 }),
            Object.freeze({ frequency: 16000, gain: 5.624929688378895 })
        ]
    }),
    Object.freeze({
        name: "Full Treble",
        values: [
            Object.freeze({ frequency: 70, gain: -5.9999250009374885 }),
            Object.freeze({ frequency: 180, gain: -5.9999250009374885 }),
            Object.freeze({ frequency: 320, gain: -5.9999250009374885 }),
            Object.freeze({ frequency: 600, gain: -2.6249671879101513 }),
            Object.freeze({ frequency: 1000, gain: 1.874976562792965 }),
            Object.freeze({ frequency: 3000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 6000, gain: 9.749878126523418 }),
            Object.freeze({ frequency: 12000, gain: 9.749878126523418 }),
            Object.freeze({ frequency: 14000, gain: 9.749878126523418 }),
            Object.freeze({ frequency: 16000, gain: 10.499868751640605 })
        ]
    }),
    Object.freeze({
        name: "Full Bass & Treble",
        values: [
            Object.freeze({ frequency: 70, gain: 4.499943750703116 }),
            Object.freeze({ frequency: 180, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 320, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: -4.499943750703116 }),
            Object.freeze({ frequency: 1000, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 3000, gain: 1.124985937675779 }),
            Object.freeze({ frequency: 6000, gain: 5.2499343758203025 }),
            Object.freeze({ frequency: 12000, gain: 6.749915626054674 }),
            Object.freeze({ frequency: 14000, gain: 7.49990625117186 }),
            Object.freeze({ frequency: 16000, gain: 7.49990625117186 })
        ]
    }),
    Object.freeze({
        name: "Live",
        values: [
            Object.freeze({ frequency: 70, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 180, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 320, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 600, gain: 3.374957813027337 }),
            Object.freeze({ frequency: 1000, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 3000, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 6000, gain: 2.6249671879101513 }),
            Object.freeze({ frequency: 12000, gain: 1.874976562792965 }),
            Object.freeze({ frequency: 14000, gain: 1.874976562792965 }),
            Object.freeze({ frequency: 16000, gain: 1.4999812502343721 })
        ]
    }),
    Object.freeze({
        name: "Techno",
        values: [
            Object.freeze({ frequency: 70, gain: 4.874939063261709 }),
            Object.freeze({ frequency: 180, gain: 3.74995312558593 }),
            Object.freeze({ frequency: 320, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 600, gain: -3.374957813027337 }),
            Object.freeze({ frequency: 1000, gain: -2.9999625004687442 }),
            Object.freeze({ frequency: 3000, gain: 0.37499531255859303 }),
            Object.freeze({ frequency: 6000, gain: 4.874939063261709 }),
            Object.freeze({ frequency: 12000, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 14000, gain: 5.9999250009374885 }),
            Object.freeze({ frequency: 16000, gain: 5.624929688378895 })
        ]
    })
];
