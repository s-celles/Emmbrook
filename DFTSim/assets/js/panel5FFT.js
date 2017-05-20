/**
 * Created by Qi on 5/20/17.
 */

var nCont = 1000;
var xHi = 10.;
var xCont = new Array(nCont);
var yCont = new Array(nCont);
var yApprox = new Array(nCont);
var fmin = 1.0 / xHi;  // \alpha_min

nMax = document.getElementById("mySamples").value;
samplesUpdateCalc(nMax);   // Initialize

fval = 1.0;

valsUpdate();
createPlots();   // Initial plot

samplesUpdate(8);   // Initialize bar plot

function getPhase() {
    phs = Number(document.querySelector('#phsBox').value);
}

function phaseUpdate(q) {   // Update slide bar
    document.querySelector('#phsBox').value = q;
    doRecalc();
}

function B1Update(q) {
    document.querySelector('#B1Box').value = q;
    doRecalc();
}

function B3Update(q) {
    document.querySelector('#B3Box').value = q;
    doRecalc();
}

function B5Update(q) {
    document.querySelector('#B5Box').value = q;
    doRecalc();
}

function B7Update(q) {
    document.querySelector('#B7Box').value = q;
    doRecalc();
}

function samplesUpdate(q) {
    samplesUpdateCalc(q);
    doRecalc();
}

function xvUpdate() {
    xv = new Array(nsamp);  // Sample x coordinates
    yv = new Array(nsamp);
    for (var i = 0; i < nMax; i++) {   // Samples range
        xv[i] = (i / nMax - 0.5) * xHi
    }
}

function samplesUpdateCalc(q) {
    document.querySelector('#samplesBox').value = Math.pow(2, q);
    nsamp = document.querySelector('#samplesBox').value;
    phs = Number(document.querySelector('#phsBox').value);
    nMax = nsamp;
    xvUpdate(phs);
}

function doRecalc() {
    getPhase();
    xvUpdate();
    valsUpdate();
    plotDataUpdate();
    plotsRedraw();
}

function valsUpdate() {

    var b1 = document.querySelector('#B1Box').value;
    var b3 = document.querySelector('#B3Box').value;
    var b5 = document.querySelector('#B5Box').value;
    var b7 = document.querySelector('#B7Box').value;

    fv = new Array(nMax);
    fv_im = new Array(nMax);
    xv_half = new Array(nMax / 2 + 1);
    fv_half = new Array(nMax / 2 + 1);
    fv_im_half = new Array(nMax / 2 + 1);
    fv_abs_half = new Array(nMax / 2 + 1);

    for (i = 0; i < nMax; i++) {  // Sample y coordinates
        if (xv[i] > phs) {
            yv[i] = 0.5
        } else {
            yv[i] = -0.5
        }
        if (xv[i] === phs) {
            yv[i] = -0.5
        }
    }

    for (var i = 0; i < nCont; i++) {
        xCont[i] = i / nCont * xHi - 0.5 * xHi // 1001 elements
    }

    for (i = 0; i < nCont; i++) {  // Analytical
        if (xCont[i] > phs) {
            yCont[i] = 0.5
        } else {
            yCont[i] = -0.5
        }
        if (xCont[i] === phs) {
            yCont[i] = -0.5
        }
        // Approximation
        // sin \omega_i t, \omega_i = 2\pi/10*i
        yApprox[i] = b1 * Math.sin(0.62832 * (xCont[i] - phs)) + b3 * Math.sin(3. * 0.62832 * (xCont[i] - phs)) +
            b5 * Math.sin(5. * 0.62832 * (xCont[i] - phs)) + b7 * Math.sin(7. * 0.62832 * (xCont[i] - phs))
    }

    for (i = 0; i < nMax; i++) {
        fv[i] = yv[i];  // Real part
        fv_im[i] = 0;
    }

    miniFFT(fv, fv_im);

    for (i = 0; i < nMax / 2 + 1; i++) {
        xv_half[i] = i * fmin;   // \alpha_k
        fv_half[i] = fv[i] * 2 / nMax;
        fv_im_half[i] = fv_im[i] * 2 / nMax;
        fv_abs_half[i] = Math.pow(fv_im_half[i] * fv_im_half[i] + fv_half[i] * fv_half[i], 0.5);
    }
}

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

function createPlots() {
    var layout1 = {
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

    var layout2 = {
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

    plt0 = document.getElementById('plt0');
    Plotly.newPlot(plt0, data0, layout1);

    plt1 = document.getElementById('plt1');
    Plotly.newPlot(plt1, data1, layout2);
}