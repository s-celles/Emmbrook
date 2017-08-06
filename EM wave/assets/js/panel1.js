/**
 * Created by Qi on 6/16/17.
 */

// Initialize variables
var nX = 250;
var nY = 250;
var xPrime = new Array(nX);
var yPrime = new Array(nY);
var eRe = new Array(nX);
var eIm = new Array(nX);
var eIntensityLine = new Array(nX);
var eIntensityHeatmap = create2DArray(nY, nX);
var thetaMax = 0.2;

var nSlider = $('#N')
    .bootstrapSlider({});
var lambdaSlider = $('#lambda')
    .bootstrapSlider({});
var aSlider = $('#a')
    .bootstrapSlider({});
var clSlider = $('#cl')
    .bootstrapSlider({});
var zSlider = $('#z')
    .bootstrapSlider({});
var n = nSlider.bootstrapSlider('getValue');
var lambda = lambdaSlider.bootstrapSlider('getValue');
var a = aSlider.bootstrapSlider('getValue');
var cl = clSlider.bootstrapSlider('getValue');
var z = Math.pow(10, zSlider.bootstrapSlider('getValue'));
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');


function xPrimeUpdate() {
    /*
     xCont will change when cl changes.
     xCont is the split of the screen.
     */
    var q0 = 2 * Math.sin(thetaMax) * cl;
    for (var i = 0; i < nX; i++) {
        xPrime[i] = q0 * (i / nX - 0.5);
    }
}

function yPrimeUpdate() {
    /*
     yCont will change when cl changes.
     yCont is the split of the screen.
     */
    for (var i = 0; i < nY; i++) {
        yPrime[i] = i / nY * cl;
    }
}

function eIntensityUpdate() {
    /*
     zRe, zIm, zIntensity, zHM will change when lambda, a, n, cl change.
     xP is the array of scatters, it is formed by a lattice.
     */
    var x = new Array(n);
    if (Number.isInteger(n)) {
        // If n is integer, then determine whether odd or even.
        if (isEven(n)) {
            for (var i = 0; i < n; i++) {
                x[i] = 1e-6 * a * (i - n / 2 + 0.5);
            }
        } else {
            for (var j = 0; j < n; j++) {
                x[j] = 1e-6 * a * (j - (n - 1) / 2);
            }
        }
    } else new TypeError('N is neither even nor odd!');

    var kv = 1e9 * 2 * Math.PI / lambda;
    for (var k = 0; k < nY; k++) {
        for (i = 0; i < nX; i++) {
            // Outer loop over positions on the screen
            eRe[i] = 0;
            eIm[i] = 0;
            for (j = 0; j < n; j++) {
                // Inner loop over particles
                var r = Math.sqrt(Math.pow(yPrime[k], 2) +
                    Math.pow(xPrime[i] - x[j], 2) +
                    Math.pow(z, 2));
                eRe[i] += Math.cos(kv * r);
                eIm[i] += Math.sin(kv * r);
            }
            // Intensity = E times its complex conjugate.
            if (k === nY - 1) { // Take the intensity of last line of y
                eIntensityLine[i] = Math.pow(eRe[i], 2) + Math.pow(eIm[i], 2);
            }
            // Intensity forms a 2D heatmap.
            eIntensityHeatmap[k][i] = Math.pow(eRe[i], 2) + Math.pow(eIm[i], 2);
        }
    }
}

function isEven(n) {
    return n % 2 === 0;
}

function create2DArray(rows, columns) {
    var arr = new Array(rows);
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(columns);
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
            },
            range: [xPrime[0] * 1.2, xPrime[xPrime.length - 1] * 1.2]
        }
    };

    var layout1 = {
        title: 'heatmap',
        titlefont: {
            size: 18
        }
    };

    var data0 = [{
        x: xPrime,
        y: eIntensityLine,
        type: 'scatter',
        mode: 'lines',
        name: 'continuous',
    }];

    var data1 = [{
        x: xPrime,
        y: yPrime,
        z: [eIntensityLine, eIntensityLine, eIntensityLine],
        type: 'heatmap',
        zmin: 0,
        zmax: 30
    }];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

function plot() {
    plt0.data[0].x = xPrime;
    plt0.data[0].y = eIntensityLine;

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