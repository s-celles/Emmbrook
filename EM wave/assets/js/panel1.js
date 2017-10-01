/**
 * Created by Qi on 6/16/17.
 */

/* jshint -W097 */
'use strict';
// Check if your browser supports ES6 feature
var supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function('(a = 0) => a');
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {
} else {
    alert('Your browser is too old! Please use a modern browser!');
}

// Initialize variables
const nX = 5;
const nY = 5;
let xPrime = new Array(nX);
let yPrime = new Array(nY);
let eRe = new Array(nX);
let eIm = new Array(nX);
let eIntensityLine = new Array(nX);
let eIntensityHeatmap = create2DArray(nY, nX);
const thetaMax = 0.2;

let nSlider = $('#N')
    .bootstrapSlider({});
let lambdaSlider = $('#lambda')
    .bootstrapSlider({});
let aSlider = $('#a')
    .bootstrapSlider({});
let clSlider = $('#cl')
    .bootstrapSlider({});
let zSlider = $('#z')
    .bootstrapSlider({});
let n = nSlider.bootstrapSlider('getValue');
let lambda = lambdaSlider.bootstrapSlider('getValue');
let a = aSlider.bootstrapSlider('getValue');
let cl = clSlider.bootstrapSlider('getValue');
let z = Math.pow(10, zSlider.bootstrapSlider('getValue'));
const plt0 = document.getElementById('plt0');
const plt1 = document.getElementById('plt1');


function xPrimeUpdate() {
    /*
     xPrime will change when cl changes.
     xPrime is the x split of the screen.
     */
    let q0 = 2 * Math.sin(thetaMax) * cl;
    for (let i = 0; i < nX; i++) {
        xPrime[i] = q0 * (i / nX - 0.5);
    }
}

function yPrimeUpdate() {
    /*
     yPrime will change when cl changes.
     yPrime is the y split of the screen.
     */
    for (let i = 0; i < nY; i++) {
        yPrime[i] = i / nY * cl;
    }
}

function intensityUpdate(re, im) {
    /*
     Take the logarithm of intensity. re and im are 2 real numbers.
     */
    return (Math.pow(re, 2) + Math.pow(im, 2));
}

function eIntensityUpdate() {
    /*
     zRe, zIm, zIntensity, zHM will change when lambda, a, n, cl change.
     x is the array of scatters, it is formed by a lattice.
     */
    let x = new Array(n);
    if (Number.isInteger(n)) {
        // If n is integer, then determine whether odd or even.
        if (isEven(n)) {
            for (let i = 0; i < n; i++) {
                x[i] = 1e-6 * a * (i - n / 2 + 0.5);
            }
        } else {
            for (let i = 0; i < n; i++) {
                x[i] = 1e-6 * a * (i - (n - 1) / 2);
            }
        }
    } else new TypeError('N is not integers!');

    let kv = 1e9 * 2 * Math.PI / lambda;
    for (let k = 0; k < nY; k++) {
        for (let i = 0; i < nX; i++) {
            // Outer loop over positions on the screen
            eRe[i] = 0;
            eIm[i] = 0;
            for (let j = 0; j < n; j++) {
                // Inner loop over particles
                let r = Math.sqrt(Math.pow(yPrime[k], 2) +
                    Math.pow(xPrime[i] - x[j], 2) +
                    Math.pow(z, 2));
                eRe[i] += Math.cos(kv * r);
                eIm[i] += Math.sin(kv * r);
            }
            // Intensity = E times its complex conjugate.
            if (k === nY - 1) { // Take the intensity of last line of y
                eIntensityLine[i] = intensityUpdate(eRe[i], eIm[i]);
            }
            // Intensity forms a 2D heatmap.
            eIntensityHeatmap[k][i] = intensityUpdate(eRe[i], eIm[i]);
        }
    }
    console.log(eIntensityLine)
}

function isEven(n) {
    return n % 2 === 0;
}

function create2DArray(rows, columns) {
    let arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(columns);
    }
    return arr;
}


// Plot
function createPlots() {
    let layout0 = {
        margin: {
            t: 50
        },
        yaxis: {
            title: 'Logarithmic light intensity',
            titlefont: {
                size: 18
            },
            range: [Math.log(Math.min(...eIntensityLine)), Math.log(Math.max(...eIntensityLine)) * 1.1] // Spread operator
        },
        xaxis: {
            title: 'Screen position x',
            titlefont: {
                size: 18
            },
            range: [xPrime[0] * 1.2, xPrime[xPrime.length - 1] * 1.2]
        }
    };

    let layout1 = {
        title: 'Logarithmic heatmap',
        titlefont: {
            size: 18
        },
        xaxis: {
            range: [xPrime[0] * 1.1, xPrime[xPrime.length - 1] * 1.1]
        }
    };

    let data0 = [{
        x: xPrime,
        y: eIntensityLine,
        type: 'scatter',
        mode: 'lines',
        name: 'continuous'
    }];

    let data1 = [{
        x: xPrime,
        y: yPrime,
        z: [eIntensityLine, eIntensityLine, eIntensityLine],
        type: 'heatmap',
        zmin: 0
    }];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

function plot() {
    plt0.data[0].x = xPrime;
    plt0.data[0].y = eIntensityLine;
    plt0.layout.yaxis.range = [Math.log(Math.min(...eIntensityLine)), Math.log(Math.max(...eIntensityLine)) * 1.1]; // Spread operator

    plt1.data[0].z = eIntensityHeatmap;

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}


// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Interactive interfaces
nSlider.on('change', function () {
    n = nSlider.bootstrapSlider('getValue'); // Change "global" value
    eIntensityUpdate();
    plot();

    $('#nSliderVal')
        .text(n);
});

lambdaSlider.on('change', function () {
    lambda = lambdaSlider.bootstrapSlider('getValue'); // Change "global" value
    eIntensityUpdate();
    plot();

    $('#lambdaSliderVal')
        .text(lambda);
});

aSlider.on('change', function () {
    a = aSlider.bootstrapSlider('getValue'); // Change "global" value
    eIntensityUpdate();
    plot();

    $('#aSliderVal')
        .text(a);
});

clSlider.on('change', function () {
    cl = clSlider.bootstrapSlider('getValue'); // Change "global" value
    xPrimeUpdate();
    yPrimeUpdate();
    eIntensityUpdate();
    plot();

    $('#clSliderVal')
        .text(cl);
});

zSlider.bootstrapSlider({
    formatter: function (value) {
        return Math.pow(10, value);
    }
});

zSlider.on('change', function () {
    z = Math.pow(10, zSlider.bootstrapSlider('getValue'));
    eIntensityUpdate();
    plot();

    $('#zSliderVal').text(z);
});


// Initialize
xPrimeUpdate();
yPrimeUpdate();
eIntensityUpdate();
createPlots();
$('#nSliderVal')
    .text(n);
$('#lambdaSliderVal')
    .text(lambda);
$('#aSliderVal')
    .text(a);
$('#clSliderVal')
    .text(cl);
$('#zSliderVal')
    .text(z);
