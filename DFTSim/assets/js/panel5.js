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

for (var i = 0; i < nCont; i++) {
    /*
    xCont will not change in this simulation.
     */
    xCont[i] = i / nCont * xHi - 0.5 * xHi
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
    yv will change as the number of samples and t0 change.
     */
    yv = new Array(nSample);
    for (var i = 0; i < nSample; i++) {  // Sample y coordinates
        if (xv[i] > (t0 + 5.0)) {
            yv[i] = -0.5
        } else if (xv[i] > t0 || xv[i] < (t0 - 5.0)) {
            yv[i] = 0.5
        } else {
            yv[i] = -0.5
        }
    }
}

function yContUpdate() {
    /*
    yCount will change as the t0 changes.
     */
    for (var i = 0; i < nCont; i++) {
        if (xCont[i] > (t0 + 5.0)) {
            yCont[i] = -0.5
        } else if (xCont[i] > t0 || xCont[i] < (t0 - 5.0)) {
            yCont[i] = 0.5
        } else {
            yCont[i] = -0.5
        }
    }
}

function yApproxUpdate() {
    /*
    yApprox will change as t0, b1, b3, b5, b7 change.
     */
    for (var i = 0; i < nCont; i++) {
        yApprox[i] = b1 * Math.sin(0.62832 * (xCont[i] - t0)) +
            b3 * Math.sin(3. * 0.62832 * (xCont[i] - t0)) +
            b5 * Math.sin(5. * 0.62832 * (xCont[i] - t0)) +
            b7 * Math.sin(7. * 0.62832 * (xCont[i] - t0))
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
    FFTUpdate();
    plot();

    $('#samplesSliderVal').text(nSample)
});

t0Slider.on('slideStop', function () {
    t0 = t0Slider.bootstrapSlider('getValue');  // Change "global" value
    yvUpdate();
    yContUpdate();
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#t0SliderVal').text(t0)
});

b1Slider.on('slideStop', function () {
    b1 = b1Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b1SliderVal').text(b1)
});

b3Slider.on('slideStop', function () {
    b3 = b3Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b3SliderVal').text(b3)
});

b5Slider.on('slideStop', function () {
    b5 = b5Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b5SliderVal').text(b5)
});

b7Slider.on('slideStop', function () {
    b7 = b7Slider.bootstrapSlider('getValue');  // Change "global" value
    yApproxUpdate();
    FFTUpdate();
    plot();

    $('#b7SliderVal').text(b7)
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
    fv = new Array(nSample);  // Cannot add 'var'
    fv_im = new Array(nSample);
    xv_half = new Array(nSample / 2 + 1);
    fv_half = new Array(nSample / 2 + 1);
    fv_im_half = new Array(nSample / 2 + 1);
    fv_abs_half = new Array(nSample / 2 + 1);

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
    var a = fv_half.map(function (x) {
        return x * Math.cos(10 * t0)
    });
    var b = fv_im_half.map(function (x) {
        return x * Math.sin(10 * t0)
    });
    var c = fv_im_half.map(function (x) {
        return x * Math.cos(10 * t0)
    });
    var d = fv_half.map(function (x) {
        return x * Math.sin(10 * t0)
    });
    m = new Array(a.length);
    n = new Array(c.length);
    for (var i = 0; i < a.length; i++) {
        m[i] = a[i] + b[i];
    }
    for (var j = 0; j < c.length; j++) {
        n[j] = c[j] - d[j];
    }
    plt0.data[0].x = xv;
    plt0.data[0].y = yv;
    plt0.data[1].y = yCont;

    plt1.data[0].x = xv_half;
    plt1.data[0].y = m;
    plt1.data[1].x = xv_half;
    plt1.data[1].y = n;
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

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1)
}

// Adjust Plotly's plot size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

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