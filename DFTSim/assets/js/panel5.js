/**
 * Created by Qi on 5/28/17.
 */

// Import libraries
var ndarray = require("ndarray");  // Modular multidimensional arrays for JavaScript.
var ops = require("ndarray-ops");  // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var show = require("ndarray-show");  // For debugging
var cwise = require("cwise");  // Elementwise operation
var pool = require("ndarray-scratch");  // A simple wrapper for typedarray-pool.
var unpack = require("ndarray-unpack");  // Converts an ndarray into an array-of-native-arrays.
var fill = require("ndarray-fill");  // Initialize an ndarray with a function.
var fft = require("ndarray-fft");  // A fast Fourier transform implementation for ndarrays.


// Initialize variables
// UI variables
var sampleSlider = $('#mySamples').bootstrapSlider({});
var t0Slider = $('#myT0').bootstrapSlider({});
var b1Slider = $('#b1').bootstrapSlider();
var b3Slider = $('#b3').bootstrapSlider();
var b5Slider = $('#b5').bootstrapSlider();
var b7Slider = $('#b7').bootstrapSlider();
var nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Number of samples
var t0 = t0Slider.bootstrapSlider('getValue');
var b1 = b1Slider.bootstrapSlider('getValue');
var b3 = b3Slider.bootstrapSlider('getValue');
var b5 = b5Slider.bootstrapSlider('getValue');
var b7 = b7Slider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Basic variables
var nCont = 1000;
var xHi = 10;
var xCont = ndarray(new Float64Array(nCont));  // Continuous value
var yCont = ndarray(new Float64Array(nCont));  // Continuous value
var yApprox = ndarray(new Float64Array(nCont));
var fmin = 1.0 / xHi;
var xv = ndarray(new Float64Array(nSample));  // Sample points
var yv = ndarray(new Float64Array(nSample));  // Sample points
var fv = pool.clone(yv);  // Real part, size: nSample
var fv_im = pool.zeros([nSample], 'float64');  // Imaginary part
var xv_half = ndarray(new Float64Array(nSample / 2 + 1));
var fv_half = ndarray(new Float64Array(nSample / 2 + 1));
var fv_im_half = ndarray(new Float64Array(nSample / 2 + 1));
var fv_abs_half = ndarray(new Float64Array(nSample / 2 + 1));

fill(xCont, function (i) {  // Initialize xCont
    /*
     xCont will not change in this simulation.
     */
    return i / nCont * xHi - 0.5 * xHi;  // Fills an ndarray with a pattern.
});


// Basic interfaces
function xvUpdate() {
    /*
     xv will not change unless the number of samples changes.
     */
    xv = ndarray(new Float64Array(nSample));  // Sample x coordinates
    fill(xv, function (i) {
        return (i / nSample - 0.5) * xHi;
    });
}

function yvUpdate() {
    /*
     yv will change as the number of samples and t0 change.
     */
    yv = ndarray(new Float64Array(nSample));
    for (var i = 0; i < nSample; i++) {  // Sample y coordinates
        if (xv.get(i) > (t0 + 5.0)) {
            yv.set(i, -0.5)
        } else if (xv.get(i) > t0 || xv.get(i) < (t0 - 5.0)) {
            yv.set(i, 0.5)
        } else {
            yv.set(i, -0.5)
        }
    }
}

function yContUpdate() {
    /*
     yCount will change as the t0 changes.
     */
    for (var i = 0; i < nCont; i++) {
        if (xCont.get(i) > (t0 + 5.0)) {
            yCont.set(i, -0.5);  // yCont[i] = -0.5
        } else if (xCont.get(i) > t0 || xCont.get(i) < (t0 - 5.0)) {
            yCont.set(i, 0.5);
        } else {
            yCont.set(i, -0.5);
        }
    }
}

function yApproxUpdate() {
    /*
     yApprox will change as t0, b1, b3, b5, b7 change.
     */
    fill(yApprox, function (i) {
        return b1 * Math.sin(0.62832 * (xCont.get(i) - t0)) +
            b3 * Math.sin(3. * 0.62832 * (xCont.get(i) - t0)) +
            b5 * Math.sin(5. * 0.62832 * (xCont.get(i) - t0)) +
            b7 * Math.sin(7. * 0.62832 * (xCont.get(i) - t0))
    });
}

// FFT
function FFTUpdate() {
    fv = pool.clone(yv);  // Real part, size: nSample
    fv_im = pool.zeros([nSample], 'float64');  // Imaginary part
    xv_half = ndarray(new Float64Array(nSample / 2 + 1));
    fv_half = ndarray(new Float64Array(nSample / 2 + 1));
    fv_im_half = ndarray(new Float64Array(nSample / 2 + 1));
    fv_abs_half = ndarray(new Float64Array(nSample / 2 + 1));

    fft(1, fv, ops.mulseq(fv_im, -1));  // Forward FFT

    fill(xv_half, function (i) {  // xv_half[i] = i * fmin;
        return i * fmin;

    });

    fill(fv_half, function (i) {  // fv_half[i] = fv[i] * 2 / nSample;
        return fv.get(i) * 2 / nSample;
    });

    fill(fv_im_half, function (i) {  // fv_im_half[i] = fv_im[i] * 2 / nSample;
        return fv_im.get(i) * 2 / nSample;
    });

    var p = ndarray(new Float64Array(nSample / 2 + 1));
    var q = ndarray(new Float64Array(nSample / 2 + 1));
    ops.add(fv_abs_half, ops.pows(p, fv_im_half, 2), ops.pows(q, fv_half, 2));  // fv_abs_half[i] = Math.sqrt(Math.pow(fv_im_half[i], 2) + Math.pow(fv_half[i], 2));
    ops.sqrteq(fv_abs_half);
    console.log(show(fv_abs_half));
}

// Plot
function plotDataUpdate() {
    console.log(show(fv_abs_half));
    var a = pool.clone(fv_half);
    var b = pool.clone(fv_im_half);
    var c = pool.clone(fv_im_half);
    var d = pool.clone(fv_half);
    // The -seq suffix denotes scalar/broadcast operations, and then perform an assignment to original array.
    ops.mulseq(a, Math.cos(10 * t0));
    ops.mulseq(b, Math.sin(10 * t0));
    ops.mulseq(c, Math.cos(10 * t0));
    ops.mulseq(d, Math.sin(10 * t0));
    ops.addeq(a, b);  // a += b
    ops.subeq(c, d);  // c -= d

    console.log(show(fv_abs_half));
    plt0.data[0].x = unpack(xv);
    plt0.data[0].y = unpack(yv);
    plt0.data[1].y = unpack(yCont);
    plt0.data[2].y = unpack(yApprox);

    plt1.data[0].x = unpack(xv_half);
    plt1.data[0].y = unpack(a);
    plt1.data[1].x = unpack(xv_half);
    plt1.data[1].y = unpack(c);
    plt1.data[2].x = unpack(xv_half);
    plt1.data[2].y = unpack(fv_abs_half);
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
            },
            range: [0, 2]
        }
    };

    var data0 = [
        {
            x: unpack(xv),
            y: unpack(yv),
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 10
            },
            name: 'samples'
        },
        {
            x: unpack(xCont),
            y: unpack(yCont),
            type: 'scatter',
            mode: 'lines',
            name: 'continuous'
        },
        {
            x: unpack(xCont),
            y: unpack(yApprox),
            type: 'scatter',
            mode: 'lines',
            name: 'approx'
        }
    ];

    var data1 = [
        {
            x: unpack(xv),
            y: unpack(yv),
            type: 'bar',
            mode: 'markers',
            name: 'Real'
        },
        {
            x: unpack(xv),
            y: unpack(yv),
            type: 'bar',
            mode: 'markers',
            name: 'Imag'
        },
        {
            x: unpack(xv),
            y: unpack(yv),
            type: 'bar',
            mode: 'markers',
            name: 'abs'
        }
    ];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1)
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
    nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Change "global" value
    xvUpdate();
    yvUpdate();
    FFTUpdate();
    plot();

    $('#samplesSliderVal').text(nSample)
});

t0Slider.on('change', function () {
    t0 = t0Slider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    yContUpdate();
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#t0SliderVal').text(t0)
});

b1Slider.on('change', function () {
    b1 = b1Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b1SliderVal').text(b1)
});

b3Slider.on('change', function () {
    b3 = b3Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b3SliderVal').text(b3)
});

b5Slider.on('change', function () {
    b5 = b5Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b5SliderVal').text(b5)
});

b7Slider.on('change', function () {
    b7 = b7Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b7SliderVal').text(b7)
});

// Initialize
xvUpdate();
yvUpdate();
yContUpdate();
yApproxUpdate();
FFTUpdate();
createPlots();
$('#samplesSliderVal').text(nSample);
$('#t0SliderVal').text(t0);
$('#b1SliderVal').text(b1);
$('#b3SliderVal').text(b3);
$('#b5SliderVal').text(b5);
$('#b7SliderVal').text(b7);