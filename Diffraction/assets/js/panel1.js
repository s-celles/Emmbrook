/**
 * Created by Qi on 6/16/17.
 */

// Initialize variables
var nCont = 200;
var nY = 200;
var xCont = [];
var yCont = [];
var zRe = [];
var zIm = [];
var zIntensity = [];
var zHM = create2DArray(nY);
var thetaMax = 0.2;

var nSlider = $('#N').bootstrapSlider({});
var lambdaSlider = $('#lambda').bootstrapSlider({});
var aSlider = $('#a').bootstrapSlider({});
var clSlider = $('#cl').bootstrapSlider({});
var n = nSlider.bootstrapSlider('getValue');
var lambda = lambdaSlider.bootstrapSlider('getValue');
var a = aSlider.bootstrapSlider('getValue');
var cl = clSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');


function xContUpdate() {
    /*
     xCont will change when cl changes.
     */
    var q0 = 2 * Math.sin(thetaMax) * cl;
    for (var i = 0; i < nCont; i++) {
        xCont[i] = q0 * (i / nCont - 0.5)
    }
}

function yContUpdate() {
    /*
     yCont will change when cl changes.
     */
    for (var i = 0; i < nY; i++) {
        yCont[i] = i / nY * cl;
    }
}

function zUpdate() {
    /*
     zRe, zIm, zIntensity, zHM will change when lambda, a, n, cl change.
     */
    var xP = [];
    if (Number.isInteger(n)) { // If n is integer, then determine whether odd or even.
        if (isEven(n)) {
            for (var i = 0; i < n; i++) {
                xP[i] = 1e-6 * a * (i - n / 2 + 0.5);
            }
        } else {
            for (var j = 0; j < n; j++) {
                xP[j] = 1e-6 * a * (j - (n - 1) / 2);
            }
        }
    } else new TypeError('n is neither even nor odd!');

    var kv = 1e9 * 2 * Math.PI / lambda;
    for (var k = 0; k < nY; k++) {
        for (i = 0; i < nCont; i++) {  // Outer loop over positions on the screen
            zRe[i] = 0;
            zIm[i] = 0;
            for (j = 0; j < n; j++) {  // Inner loop over particles
                var r = Math.pow(yCont[k] * yCont[k] + (xCont[i] - xP[j]) * (xCont[i] - xP[j]), 0.5);
                zRe[i] += Math.cos(kv * r);
                zIm[i] += Math.sin(kv * r);
            }
            if (k === nY - 1) {
                zIntensity[i] = zRe[i] * zRe[i] + zIm[i] * zIm[i]
            }
            zHM[k][i] = zRe[i] * zRe[i] + zIm[i] * zIm[i];
        }
    }
}

function isEven(n) {
    return n % 2 === 0;
}

function create2DArray(rows) {
    var arr = [];
    for (var i = 0; i < rows; i++) {
        arr[i] = [];
    }
    return arr;
}


// Plot
function createPlots() {
    var layout0 = {
        margin: {
            t: 50
        },
        yaxis: {
            title: 'Light intensity',
            titlefont: {
                size: 18
            }
        },
        xaxis: {
            title: 'Screen position y',
            titlefont: {
                size: 18
            }
        }
    };

    var layout1 = {
        title: 'heatmap',
        titlefont: {
            size: 18
        }
    };

    var data0 = [{
        x: xCont,
        y: zIntensity,
        type: 'scatter',
        mode: 'lines',
        name: 'continuous'
    }];

    var data1 = [{
        z: [zIntensity, zIntensity, zIntensity],
        type: 'heatmap'
    }];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

function plotDataUpdate() {
    plt0.data[0].x = xCont;
    plt0.data[0].y = zIntensity;

    plt1.data[0].z = zHM;
}

function plotsRedraw() {
    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}

function plot() {
    plotDataUpdate();
    plotsRedraw();
}

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Interactive interfaces
nSlider.on('change', function () {
    n = nSlider.bootstrapSlider('getValue'); // Change "global" value
    zUpdate();
    plot();

    $('#nSliderVal').text(n);
});

lambdaSlider.on('change', function () {
    lambda = lambdaSlider.bootstrapSlider('getValue'); // Change "global" value
    zUpdate();
    plot();

    $('#lambdaSliderVal').text(lambda);
});

aSlider.on('change', function () {
    a = aSlider.bootstrapSlider('getValue'); // Change "global" value
    zUpdate();
    plot();

    $('#aSliderVal').text(a);
});

clSlider.on('change', function () {
    cl = clSlider.bootstrapSlider('getValue'); // Change "global" value
    xContUpdate();
    yContUpdate();
    zUpdate();
    plot();

    $('#clSliderVal').text(cl);
});


// Initialize
xContUpdate();
yContUpdate();
zUpdate();
createPlots();
$('#nSliderVal').text(n);
$('#lambdaSliderVal').text(lambda);
$('#aSliderVal').text(a);
$('#clSliderVal').text(cl);