/**
 * Created by Qi on 5/31/17.
 */

// Variables
var nSample = 200;
var xHi = 10;
var xv = new Array(nSample);
var yv = new Array(nSample);
var xPoints = new Array(nSample);
var yPoints = new Array(nSample);
var ampRand = Math.random();
var phsRand = Math.random();
var freqRand = Math.random();

var phaseSlider = $('#myPhase').bootstrapSlider({});
var ampSlider = $('#myAmplitude').bootstrapSlider({});
var freqSlider = $('#myFreq').bootstrapSlider({});
var phase = phaseSlider.bootstrapSlider('getValue');
var amplitude = ampSlider.bootstrapSlider('getValue');
var frequency = freqSlider.bootstrapSlider('getValue');
var plt = document.getElementById('plt');

for (var i = 0; i < nSample; i++) {
    xv[i] = i / nSample * xHi;
    yv[i] = Math.sin(2 * Math.PI * frequency * xv[i])
}

for (var j = 0; j < nSample; j++) {
    xPoints[j] = j / nSample * xHi;
    yPoints[j] = ampRand * Math.sin(phsRand + freqRand * 2 * Math.PI * xPoints[j])
}

function yvUpdate() {
    /*
     yv will change when amplitude, phase, or frequency changes.
     */
    for (var i = 0; i < nSample; i++) {
        yv[i] = amplitude * Math.sin(1.0 * phase + 2 * Math.PI * frequency * xv[i])
    }
}

function plot() {
    plt.data[0].y = yv;
    Plotly.redraw(plt);
}

function createPlot() {
    var layout = {
        margin: {t: 0},
        yaxis: {title: 'Height Y (m)', titlefont: {size: 18}},
        xaxis: {title: 'Time t (s)', titlefont: {size: 18}}
    };

    var data = [
        {x: xv, y: yv, type: 'scatter', mode: 'lines', name: 'fit'},
        {x: xPoints, y: yPoints, type: 'scatter', mode: 'markers', name: 'data'}
    ];

    Plotly.newPlot(plt, data, layout);
}

// Interactive interfaces
phaseSlider.on('slideStop', function () {
    phase = phaseSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    plot();

    $('#phaseSliderVal').text(phase)
});

ampSlider.on('slideStop', function () {
    amplitude = ampSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    plot();

    $('#ampSliderVal').text(amplitude)
});

freqSlider.on('slideStop', function () {
    frequency = freqSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    plot();

    $('#freqSliderVal').text(frequency)
});

// Adjust Plotly's plot size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

// Initialize
yvUpdate();
createPlot();
$('#phaseSliderVal').text(phase);
$('#ampSliderVal').text(amplitude);
$('#freqSliderVal').text(frequency);