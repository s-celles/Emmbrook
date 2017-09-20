/**
 * Created by Qi on 5/31/17.
 */

// Variables
var nSamples = 64;
var nCont = nSamples * 10;
var xv = new Array(nSamples);
var yv = new Array(nSamples);
var xCont = new Array(nCont); // Continuous value
var yCont = new Array(nCont); // Continuous value
var xHi = 10;
var fmin = 1.0 / xHi;
var ampRand = Math.random();
var phsRand = Math.random();
var freqRand = Math.random();

var phaseSlider = $('#myPhase')
    .bootstrapSlider({});
var ampSlider = $('#myAmplitude')
    .bootstrapSlider({});
var freqSlider = $('#myFreq')
    .bootstrapSlider({});
var phase = phaseSlider.bootstrapSlider('getValue');
var amplitude = ampSlider.bootstrapSlider('getValue');
var frequency = freqSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');

for (var i = 0; i < nSamples; i++) {
    xv[i] = i / nSamples * xHi;
    yv[i] = Math.sin(2 * Math.PI * frequency * xv[i]);
}

for (var j = 0; j < nCont; j++) {
    xCont[j] = j / nCont * xHi;
    yCont[j] = ampRand * Math.sin(phsRand + freqRand * 2 * Math.PI * xCont[j]);
}

function yvUpdate() {
    /*
     yv will change when amplitude, phase, or frequency changes.
     */
    for (var i = 0; i < nSamples; i++) {
        yv[i] = amplitude * Math.cos(1.0 * phase + 2 * Math.PI * frequency * xv[i]);
    }
}

function yContUpdate() {
    /*
     yCont will change when amplitude, phase, or frequency changes.
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
    fv = new Array(nSamples); // Cannot add 'var'
    fv_im = new Array(nSamples);
    xv_half = new Array(nSamples / 2);
    fv_half = new Array(nSamples / 2);
    fv_im_half = new Array(nSamples / 2);
    fv_abs_half = new Array(nSamples / 2);

    for (var i = 0; i < nSamples; i++) {
        fv[i] = yv[i]; // Real part
        fv_im[i] = 0;
    }

    miniFFT(fv, fv_im);

    for (i = 0; i < nSamples / 2; i++) {
        xv_half[i] = i * fmin; // \alpha_k
        fv_half[i] = fv[i] * 2 / nSamples;
        fv_im_half[i] = fv_im[i] * 2 / nSamples;
        fv_abs_half[i] = Math.sqrt(fv_im_half[i] * fv_im_half[i] + fv_half[i] * fv_half[i]);
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
            title: 'Frequency (hz)',
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
            x: xv_half,
            y: fv_half,
            type: 'bar',
            mode: 'markers',
            name: 'Real'
        },
        {
            x: xv_half,
            y: fv_im_half,
            type: 'bar',
            mode: 'markers',
            name: 'Imag'
        },
        {
            x: xv_half,
            y: fv_abs_half,
            type: 'bar',
            mode: 'markers',
            name: 'abs'
        }
    ];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

// Interactive interfaces
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

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

// Initialize
yvUpdate();
yContUpdate();
fftUpdate();
createPlots();
$('#phaseSliderVal')
    .text(phase);
$('#ampSliderVal')
    .text(amplitude);
$('#freqSliderVal')
    .text(frequency);
