/**
 * Created by Qi on 5/30/17.
 */

// Variables
var nCont = 1000;
var xCont = new Array(nCont); // Continuous value
var yCont = new Array(nCont); // Continuous value
var xHi = 10;
var fmin = 1.0 / xHi;

var sampleSlider = $('#mySamples')
    .bootstrapSlider({});
var phaseSlider = $('#myPhase')
    .bootstrapSlider({});
var ampSlider = $('#myAmplitude')
    .bootstrapSlider({});
var freqSlider = $('#myFreq')
    .bootstrapSlider({});
var nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue')); // Number of samples
var phase = phaseSlider.bootstrapSlider('getValue');
var amplitude = ampSlider.bootstrapSlider('getValue');
var frequency = freqSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');

for (var i = 0; i < nCont; i++) {
    /*
     xCont will not change in this simulation.
     */
    xCont[i] = i / nCont * xHi;
}

// Basic interfaces
function xvUpdate() {
    /*
     xv will not change unless the number of samples changes.
     */
    xv = new Array(nSample); // Sample x coordinates
    for (var i = 0; i < nSample; i++) { // Samples range
        xv[i] = i / nSample * xHi;
    }
}

function yvUpdate() {
    /*
     yv will not change unless the number of samples, amplitude, phase or frequency change.
     */
    yv = new Array(nSample);
    for (var i = 0; i < nSample; i++) {
        yv[i] = amplitude * Math.cos(1.0 * phase + 2 * Math.PI * frequency * xv[i]);
    }
}

function yContUpdate() {
    /*
     yCont will not change unless the number of samples, amplitude, phase or frequency change.
     */
    for (var i = 0; i < nCont; i++) {
        yCont[i] = amplitude * Math.cos(1.0 * phase + 2 * Math.PI * frequency * xCont[i]);
    }
}

// FFT
function miniFFT(re, im) {
    var N = re.length;
    for (var i = 0; i < N; i++) {
        for (var j = 0, h = i, k = N; k >>= 1; h >>= 1)
            j = (j << 1) | (h & 1);
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0];
            im[j] = [im[i], im[i] = im[j]][0];
        }
    }

    for (var hN = 1; hN * 2 <= N; hN *= 2)
        for (i = 0; i < N; i += hN * 2)
            for (j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN),
                    sin = Math.sin(Math.PI * (j - i) / hN);
                var tre = re[j + hN] * cos + im[j + hN] * sin,
                    tim = -re[j + hN] * sin + im[j + hN] * cos;
                re[j + hN] = re[j] - tre;
                im[j + hN] = im[j] - tim;
                re[j] += tre;
                im[j] += tim;
            }
}

function fftUpdate() {
    fv = new Array(nSample); // Cannot add 'var'
    fv_im = new Array(nSample);
    xv_half = new Array(nSample / 2 + 1);
    fv_half = new Array(nSample / 2 + 1);
    fv_im_half = new Array(nSample / 2 + 1);
    fv_abs_half = new Array(nSample / 2 + 1);

    for (var i = 0; i < nSample; i++) {
        fv[i] = yv[i]; // Real part
        fv_im[i] = 0;
    }

    miniFFT(fv, fv_im);

    for (i = 0; i < nSample / 2 + 1; i++) {
        xv_half[i] = i * fmin; // \alpha_k
        fv_half[i] = fv[i] * 2 / nSample;
        fv_im_half[i] = fv_im[i] * 2 / nSample;
        fv_abs_half[i] = Math.sqrt(Math.pow(fv_im_half[i], 2) + Math.pow(fv_half[i], 2));
    }
}

// Plot
function plotDataUpdate() {
    plt0.data[0].x = xv;
    plt0.data[0].y = yv;
    plt0.data[1].y = yCont;

    plt1.data[0].x = xv_half;
    plt1.data[0].y = fv_half;
    plt1.data[1].x = xv_half;
    plt1.data[1].y = fv_im_half;
    plt1.data[2].x = xv_half;
    plt1.data[2].y = fv_abs_half;
}

function plotsRedraw() {
    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}

function plot() {
    plotDataUpdate();
    plotsRedraw();
}

function createPlots() {
    var layout0 = {
        margin: {
            t: 0
        },
        yaxis: {
            title: 'Height Y (m)',
            titlefont: {
                size: 18
            }
        },
        xaxis: {
            title: 'Time t (s)',
            titlefont: {
                size: 18
            }
        }
    };

    var layout1 = {
        margin: {
            t: 0
        },
        yaxis: {
            title: 'FFT',
            titlefont: {
                size: 18
            }
        },
        xaxis: {
            title: 'Frequency (Hz)',
            titlefont: {
                size: 18
            }
        }
    };

    var data0 = [{
            x: xv,
            y: yv,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 10
            },
            name: 'samples'
        },
        {
            x: xCont,
            y: yCont,
            type: 'scatter',
            mode: 'lines',
            name: 'continuous'
        }
    ];

    var data1 = [{
            x: xv,
            y: yv,
            type: 'bar',
            mode: 'markers',
            name: 'Real'
        },
        {
            x: xv,
            y: yv,
            type: 'bar',
            mode: 'markers',
            name: 'Imag'
        },
        {
            x: xv,
            y: yv,
            type: 'bar',
            mode: 'markers',
            name: 'abs'
        }
    ];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

// Interactive interfaces
sampleSlider.bootstrapSlider({
    formatter: function (value) {
        return Math.pow(2, value);
    }
});

sampleSlider.on('change', function () {
    nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue')); // Change "global" value
    xvUpdate();
    yvUpdate();
    yContUpdate();
    fftUpdate();
    plot();

    $('#samplesSliderVal')
        .text(nSample);
    freqSlider.bootstrapSlider('setAttribute', 'max', 1.0 / xHi * (nSample / 2.0)); // Change slide's max value
    freqSlider.bootstrapSlider('refresh'); // To make it synchronously changing
});

phaseSlider.on('change', function () {
    phase = phaseSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    yContUpdate();
    fftUpdate();
    plot();

    $('#phaseSliderVal')
        .text(phase);
});

ampSlider.on('change', function () {
    amplitude = ampSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    yContUpdate();
    fftUpdate();
    plot();

    $('#ampSliderVal')
        .text(amplitude);
});

freqSlider.on('change', function () {
    frequency = freqSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    yContUpdate();
    fftUpdate();
    plot();

    $('#freqSliderVal')
        .text(frequency);
});

// Initialize
xvUpdate();
yvUpdate();
yContUpdate();
fftUpdate();
createPlots();
$('#samplesSliderVal')
    .text(nSample);
$('#phaseSliderVal')
    .text(phase);
$('#ampSliderVal')
    .text(amplitude);
$('#freqSliderVal')
    .text(frequency);
