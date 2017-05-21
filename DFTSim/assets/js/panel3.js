/**
 * Created by Qi on 5/20/17.
 */

var nMax = 64
var nCont = nMax * 10
var xHi = 10.
var xv = new Array(nMax)
var yv = new Array(nMax)
var xCont = new Array(nCont)
var yCont = new Array(nCont)
var fmin = 1.0 / xHi

document.querySelector('#myFreq').value = fmin
document.querySelector('#myFreq').step = fmin
document.querySelector('#myFreq').min = 0
document.querySelector('#myFreq').max = 1.0 / xHi * (nMax / 4.0)

fval = document.getElementById("myFreq").value;

for (var i = 0; i < nMax; i++) {
    xv[i] = i / nMax * xHi;
    yv[i] = Math.sin(2. * Math.pi * fval * xv[i])
}

ampRand = Math.random()
phsRand = Math.random()
freqRand = Math.random()

for (var i = 0; i < nCont; i++) {
    xCont[i] = i / nCont * xHi;
    yCont[i] = ampRand * Math.sin(phsRand + freqRand * 2. * 3.1415 * xCont[i])
}

function freqUpdate(q) {
    document.querySelector('#freqBox').value = q;
    doRecalc();
}
function ampUpdate(q) {
    document.querySelector('#ampBox').value = q;
    doRecalc();
}
function phaseUpdate(q) {
    document.querySelector('#phsBox').value = q;
    doRecalc();
}

valsUpdate();
createPlots();

function doRecalc() {
    valsUpdate();
    plotDataUpdate();
    plotsRedraw();
}

function plotDataUpdate() {
    plt0.data[0].x = xv;
    plt0.data[0].y = yv;
    plt0.data[1].y = yCont;
    plt1.data[0].y = fv_half;
    plt1.data[0].x = xv_half;
    plt1.data[1].y = fv_im_half;
    plt1.data[1].x = xv_half;
    plt1.data[2].x = xv_half;
    plt1.data[2].y = fv_abs_half;
}

function plotsRedraw() {
    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}

function valsUpdate() {
    var freq = document.getElementById("myFreq").value;
    var phs = document.getElementById("myPhase").value;
    var amp = document.getElementById("myAmp").value;
    fv = new Array(nMax)
    fv_im = new Array(nMax)
    xv_half = new Array(nMax / 2)
    fv_half = new Array(nMax / 2)
    fv_im_half = new Array(nMax / 2)
    fv_abs_half = new Array(nMax / 2)

    for (var i = 0; i < nMax; i++) {
        yv[i] = amp * Math.cos(1.0 * phs + 2. * 3.1415926536 * freq * xv[i])
    }

    for (var i = 0; i < nCont; i++) {
        yCont[i] = amp * Math.cos(1.0 * phs + 2. * 3.1415926536 * freq * xCont[i])
    }


    for (var i = 0; i < nMax; i++) {
        fv[i] = yv[i];
        fv_im[i] = 0;
    }

    miniFFT(fv, fv_im);

    for (var i = 0; i < nMax / 2; i++) {
        xv_half[i] = i * fmin;
        fv_half[i] = fv[i] * 2 / nMax;
        fv_im_half[i] = fv_im[i] * 2 / nMax;
        fv_abs_half[i] = Math.pow(fv_im_half[i] * fv_im_half[i] + fv_half[i] * fv_half[i], 0.5)
    }
}


function miniFFT(re, im) {
    var N = re.length;
    for (var i = 0; i < N; i++) {
        for (var j = 0, h = i, k = N; k >>= 1; h >>= 1)
            j = (j << 1) | (h & 1);
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0]
            im[j] = [im[i], im[i] = im[j]][0]
        }
    }
    for (var hN = 1; hN * 2 <= N; hN *= 2)
        for (var i = 0; i < N; i += hN * 2)
            for (var j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN),
                    sin = Math.sin(Math.PI * (j - i) / hN)
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
        margin: {t: 0},
        yaxis: {title: 'Height Y (m)', titlefont: {size: 36}},
        xaxis: {title: 'Time t (s)', titlefont: {size: 36}}
    };

    var layout2 = {
        margin: {t: 0},
        yaxis: {title: 'FFT', titlefont: {size: 36}},
        xaxis: {title: 'Frequency (hz)', titlefont: {size: 36}}
    };

    var data0 = [
        {x: xv, y: yv, type: 'scatter', mode: 'markers', marker: {size: 10}, name: 'samples'},
        {x: xCont, y: yCont, type: 'scatter', mode: 'lines', name: 'continuous'}
    ]

    var data1 = [
        {x: xv, y: yv, type: 'bar', mode: 'markers', name: 'Real'},
        {x: xv, y: yv, type: 'bar', mode: 'markers', name: 'Imag'},
        {x: xv, y: yv, type: 'bar', mode: 'markers', name: 'abs'}
    ]

    plt0 = document.getElementById('plt0');
    Plotly.newPlot(plt0, data0, layout1);

    plt1 = document.getElementById('plt1');
    Plotly.newPlot(plt1, data1, layout2);
}