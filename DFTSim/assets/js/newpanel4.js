/**
 * Created by Qi on 5/30/17.
 */

// Variables
var nCont = 1000;
var xHi = 10;
var xCont = new Array(nCont);  // Continuous value
var yCont = new Array(nCont);  // Continuous value
var fmin = 1.0 / xHi;

var sampleSlider = $('#mySamples').bootstrapSlider({});
var phaseSlider = $('#myPhase').bootstrapSlider({});
var ampSlider = $('#myamplitude').bootstrapSlider({});
var freqSlider = $('#myFreq').bootstrapSlider({});
var nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Number of samples
var phase = phaseSlider.bootstrapSlider('getValue');
var amplitude = ampSlider.bootstrapSlider('getValue');
var frequency = freqSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');

for (var i = 0; i < nCont; i++) {
    /*
     xCont will not change in this simulation.
     */
    xCont[i] = i / nCont * xHi
}

// Basic interfaces
function xvUpdate() {
    /*
     xv will not change unless the number of samples changes.
     */
    xv = new Array(nSample);  // Sample x coordinates
    for (var i = 0; i < nSample; i++) {   // Samples range
        xv[i] = (i / nSample - 0.5) * xHi
    }
}

function yvUpdate() {
    /*
     yv will not change unless the number of samples, amplitude, phase or frequency change.
     */
    for (var i = 0; i < nSample; i++) {
        yv[i] = amplitude * Math.cos(1.0 * phase + 2. * 3.1415926536 * frequency * xv[i])
    }
}

function yContUpdate() {
    /*
     yCont will not change unless the number of samples, amplitude, phase or frequency change.
     */
    for (var i = 0; i < nSample; i++) {
        yCont[i] = amplitude * Math.cos(1.0 * phase + 2. * 3.1415926536 * frequency * xCont[i])
    }
}

// Interactive interfaces
sampleSlider.bootstrapSlider({
    formatter: function (value) {
        return Math.pow(2, value);
    }
});

sampleSlider.on('slideStop', function () {
    nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Change "global" value
    xvUpdate();
    yvUpdate();
    yContUpdate();
    FFTUpdate();
    plot();

    $('#samplesSliderVal').text(nSample)
});

phaseSlider.on('slideStop', function () {
    phase = phaseSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    yCountUpdate();
    FFTUpdate();
    plot();

    $('#phaseSliderVal').text(phase)
});

ampSlider.on('slideStop', function () {
    amplitude = ampSlider.bootstrapSlider('getValue');  // Change "global" value
    yContUpdate();
    FFTUpdate();
    plot();

    $('#ampSliderVal').text(amplitude)
});

freqSlider.on('slideStop', function () {
    frequency = freqSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    yContUpdate();
    FFTUpdate();
    plot();

    $('#freqSliderVal').text(frequency)
});