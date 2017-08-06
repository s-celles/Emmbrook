/**
 * Created by Qi on 6/16/17.
 */

// Initialize variables
var nX = 250;
var nY = 250;
var xCont = new Array(nX);
var yCont = new Array(nY);
var zRe = new Array(nX);
var zIm = new Array(nX);
var zIntensity = new Array(nX);
var zHM = create2DArray(nY, nX);
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
console.log(z)
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');


function xContUpdate() {
    /*
     xCont will change when cl changes.
     xCont is the split of the screen.
     */
    var q0 = 2 * Math.sin(thetaMax) * cl;
    for (var i = 0; i < nX; i++) {
        xCont[i] = q0 * (i / nX - 0.5);
    }
}

function yContUpdate() {
    /*
     yCont will change when cl changes.
     yCont is the split of the screen.
     */
    for (var i = 0; i < nY; i++) {
        yCont[i] = i / nY * cl;
    }
}

function zUpdate() {
    /*
     zRe, zIm, zIntensity, zHM will change when lambda, a, n, cl change.
     xP is the array of scatters, it is formed by a lattice.
     */
    var xP = new Array(n);
    if (Number.isInteger(n)) {
        // If n is integer, then determine whether odd or even.
        if (isEven(n)) {
            for (var i = 0; i < n; i++) {
                xP[i] = 1e-6 * a * (i - n / 2 + 0.5);
            }
        } else {
            for (var j = 0; j < n; j++) {
                xP[j] = 1e-6 * a * (j - (n - 1) / 2);
            }
        }
    } else new TypeError('N is neither even nor odd!');

    var kv = 1e9 * 2 * Math.PI / lambda;
    for (var k = 0; k < nY; k++) {
        for (i = 0; i < nX; i++) {
            // Outer loop over positions on the screen
            zRe[i] = 0;
            zIm[i] = 0;
            for (j = 0; j < n; j++) {
                // Inner loop over particles
                var r = Math.sqrt(Math.pow(yCont[k], 2) + Math.pow(xCont[i] - xP[j], 2) + Math.pow(z, 2));
                zRe[i] += Math.cos(kv * r);
                zIm[i] += Math.sin(kv * r);
            }
            // Intensity = E times its complex conjugate.
            if (k === nY - 1) { // Take the intensity of last line of y
                zIntensity[i] = Math.pow(zRe[i], 2) + Math.pow(zIm[i], 2);
            }
            // Intensity forms a 2D heatmap.
            zHM[k][i] = Math.pow(zRe[i], 2) + Math.pow(zIm[i], 2);
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
            },
            // range: [0, 50]
        },
        xaxis: {
            title: 'Screen position y',
            titlefont: {
                size: 18
            },
            range: [xCont[0] * 1.2, xCont[xCont.length - 1] * 1.2]
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
        name: 'continuous',
    }];

    var data1 = [{
        x: xCont,
        y: yCont,
        z: [zIntensity, zIntensity, zIntensity],
        type: 'heatmap',
        zmin: 0,
        zmax: 30
    }];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

function plot() {
    plt0.data[0].x = xCont;
    plt0.data[0].y = zIntensity;

    plt1.data[0].z = zHM;

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
    zUpdate();
    plot();

    $('#nSliderVal')
        .text(n);
});

lambdaSlider.on('change', function () {
    lambda = lambdaSlider.bootstrapSlider('getValue'); // Change "global" value
    zUpdate();
    plot();

    $('#lambdaSliderVal')
        .text(lambda);
});

aSlider.on('change', function () {
    a = aSlider.bootstrapSlider('getValue'); // Change "global" value
    zUpdate();
    plot();

    $('#aSliderVal')
        .text(a);
});

clSlider.on('change', function () {
    cl = clSlider.bootstrapSlider('getValue'); // Change "global" value
    xContUpdate();
    yContUpdate();
    zUpdate();
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
    zUpdate();
    plot();

    $('#zSliderVal').text(z);
});


// Initialize
xContUpdate();
yContUpdate();
zUpdate();
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