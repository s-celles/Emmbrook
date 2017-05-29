/**
 * Created by Qi on 5/28/17.
 */

// Variables
var nCont = 1000;
var xHi = 10;
var xCont = new Array(nCont);  // Continuous value
var yCont = new Array(nCont);  // Continuous value
var yApprox = new Array(nCont);
var fmin = 1.0 / xHi;

var sampleSlider = $('#mySamples').bootstrapSlider();
var phaseSlider = $('#myPhase').bootstrapSlider();
var b1Slider = $('#b1').bootstrapSlider();
var b3Slider = $('#b3').bootstrapSlider();
var b5Slider = $('#b5').bootstrapSlider();
var b7Slider = $('#b7').bootstrapSlider();
var nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Number of samples
var phase = phaseSlider.bootstrapSlider('getValue');
var b1 = b1Slider.bootstrapSlider('getValue');
var b3 = b3Slider.bootstrapSlider('getValue');
var b5 = b5Slider.bootstrapSlider('getValue');
var b7 = b7Slider.bootstrapSlider('getValue');

for (var i = 0; i < nCont; i++) {
    /* xCont will not change in this simulation.
     */
    xCont[i] = i / nCont * xHi - 0.5 * xHi
}

xvUpdate();
yvUpdate();
yCountUpdate();
yApproxUpdate();
FFTUpdate();
createPlots();

// Basic interfaces
function xvUpdate() {
    /* xv will not change unless the number of samples changes.
     */
    xv = new Array(nSample);  // Sample x coordinates
    for (var i = 0; i < nSample; i++) {   // Samples range
        xv[i] = (i / nSample - 0.5) * xHi
    }
}

function yvUpdate() {
    /* yv will change as the number of samples and phase change.
     */
    yv = new Array(nSample);
    for (var i = 0; i < nSample; i++) {  // Sample y coordinates
        if (xv[i] > phase) {
            yv[i] = 0.5
        } else {
            yv[i] = -0.5
        }
    }
}

function yCountUpdate() {
    /* yCount will change as the phase changes.
     */
    for (var i = 0; i < nCont; i++) {
        if (xCont[i] > phase) {
            yCont[i] = 0.5
        } else {
            yCont[i] = -0.5
        }
    }
}

function yApproxUpdate() {
    /* yApprox will change as phase, b1, b3, b5, b7 change.
     */
    for (var i = 0; i < nCont; i++) {
        yApprox[i] = b1 * Math.sin(0.62832 * (xCont[i] - phase)) +
            b3 * Math.sin(3. * 0.62832 * (xCont[i] - phase)) +
            b5 * Math.sin(5. * 0.62832 * (xCont[i] - phase)) +
            b7 * Math.sin(7. * 0.62832 * (xCont[i] - phase))
    }
}

// UI interaction
sampleSlider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + Math.pow(2, value);  // For displaying value
    }
});

phaseSlider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

b1Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

b3Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

b5Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

b7Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

sampleSlider.on('slideStop', function () {
    nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Change "global" value
    xvUpdate();
    yvUpdate();
    replot()
});

phaseSlider.on('slideStop', function () {
    phase = phaseSlider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    yCountUpdate();
    yApproxUpdate();
    plot()
});

b1Slider.on('slideStop', function () {
    b1 = b1Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    plot()
});

b3Slider.on('slideStop', function () {
    b3 = b3Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    plot()
});

b5Slider.on('slideStop', function () {
    b5 = b5Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    plot()
});

b7Slider.on('slideStop', function () {
    b7 = b7Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    plot()
});

// FFT
function miniFFT(re, im) {
    var N = re.length;
    for (var i = 0; i < N; i++) {
        for (var j = 0, h = i, k = N; k >>= 1; h >>= 1)
            j = (j << 1) | (h & 1);
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0];
            im[j] = [im[i], im[i] = im[j]][0]
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

function FFTUpdate() {
    var fv = new Array(nSample);
    var fv_im = new Array(nSample);
    var xv_half = new Array(nSample / 2 + 1);
    var fv_half = new Array(nSample / 2 + 1);
    var fv_im_half = new Array(nSample / 2 + 1);
    var fv_abs_half = new Array(nSample / 2 + 1);

    for (var i = 0; i < nSample; i++) {
        fv[i] = yv[i];  // Real part
        fv_im[i] = 0;
    }

    miniFFT(fv, fv_im);

    for (i = 0; i < nSample / 2 + 1; i++) {
        xv_half[i] = i * fmin;   // \alpha_k
        fv_half[i] = fv[i] * 2 / nSample;
        fv_im_half[i] = fv_im[i] * 2 / nSample;
        fv_abs_half[i] = Math.pow(fv_im_half[i] * fv_im_half[i] + fv_half[i] * fv_half[i], 0.5);
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
    plotsRedraw()
}

function createPlots() {
    var layout0 = {
        margin: {
            t: 0
        },
        yaxis: {
            title: 'Height Y (m)',
            titlefont: {
                size: 24
            }
        },
        xaxis: {
            title: 'Time t (s)',
            titlefont: {
                size: 24
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
                size: 24
            }
        },
        xaxis: {
            title: 'Frequency (hz)',
            titlefont: {
                size: 24
            },
            range: [0, 2]
        }
    };

    var data0 = [
        {
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
        },
        {
            x: xCont,
            y: yApprox,
            type: 'scatter',
            mode: 'lines',
            name: 'approx'
        }
    ];

    var data1 = [
        {
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

    var plt0 = document.getElementById('plt0');
    Plotly.newPlot(plt0, data0, layout0);

    var plt1 = document.getElementById('plt1');
    Plotly.newPlot(plt1, data1, layout1)
}