/**
 * Originally written by Makani Cartwright.
 * Modified by Qi on 6/8/17.
 */

'use strict';
// Check if your browser supports ES6 feature
let supportsES6 = function () { // Test if ES6 is ~fully supported
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

// Variables
const pi = math.PI;
let nc = 1000;
let ns = 20;

// Plot 1 Variables
let xc = [];
let xd;
let yc = new Array(nc);
let yd = [];
let yda = [];

// Plot 2 Variables
let k_x = [];
let k_y = [];
let k_plt = [];
let ka = null;
let k_a = [];
let bzp_x = [];
let bzp_y = [];
let bzm_x = [];
let bzm_y = [];
// Interactive variables
let kSlider = $('#k').bootstrapSlider({});
let k = kSlider.bootstrapSlider('getValue');
const plt0 = document.getElementById('plt0');
const plt1 = document.getElementById('plt1');


//Initializes Plots
function initial() {
    for (let i = -ns; i <= ns; i++) {
        k_x.push(i);
        k_y.push(0);
    }
    for (let i = -.2; i <= .2; i += .05) {
        bzp_x.push(ns / 2);
        bzp_y.push(i);
        bzm_x.push(-ns / 2);
        bzm_y.push(i);
    }
    valsUpdate();
    createPlots();
}

function valsUpdate() {
    k_x = [];
    k_y = [];
    k_plt = [k];
    ka = null;
    //Updates Wavefom
    xc = nj.arange(0., 1., 1. / nc).tolist();
    for (let i = 0; i < (nc + 1); i++) {
        yc[i] = math.cos(2 * pi * k * xc[i])
    }
    // Updates Sampled
    xd = nj.arange(0., 1., 1. / ns).tolist();
    for (let i = 0; i < (ns + 1); i++) {
        yd[i] = math.cos(2 * pi * k * xd[i])
    }
    //Updates Aliased
    if (k > ns / 2) {
        ka = k - ns;
        k_a = [ka];
        for (let i = 0; i < (nc + 1); i++) {
            yda[i] = math.cos(2 * pi * ka * xc[i])
        }
    } else if (k < -ns / 2) {
        ka = parseInt(k) + ns;
        k_a = [ka];
        for (let i = 0; i < (nc + 1); i++) {
            yda[i] = math.cos(2 * pi * ka * xc[i])
        }
    }
    else {
        yda = [];
        k_a = [];
    }
    //Updates k space plot
    for (let i = -ns; i <= ns; i++) {
        k_x.push(i);
        k_y.push(0);
    }
}


// Plot
function plot() {
    plt0.data[0].x = xc;
    plt0.data[0].y = yc;

    Plotly.redraw(plt0);
}

function createPlots() {
    let layout0 = {
        margin: {
            t: 0,
            b: 100
        },
        yaxis: {
            title: '<i>X<sub>k</sub></i>',
            titlefont: {
                size: 24
            }
        },
        xaxis: {
            title: '<i>ja</i>',
            titlefont: {
                size: 24
            }
        }
    };

    let layout1 = {
        title: "<i>k</i> Space",
        titlefont: {
            size: 20
        },
        margin: {
            t: 100
        },
        xaxis: {
            title: '<i>k</i>'
        },
        yaxis: {
            visible: false
        },
    };

    let data0 = [
        {
            x: xc,
            y: yc,
            type: 'scatter',
            mode: 'lines',
            name: 'Waveform'
        },
        {
            x: xd,
            y: yd,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 10
            },
            name: 'Sampled'
        },
        {
            x: xc,
            y: yda,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'green',
                dash: 'dash',
            },
            name: 'Aliased'
        }
    ];

    let data1 = [
        {
            x: k_x,
            y: k_y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                symbol: 'circle-open',
                size: 10,
            },
            name: "k Values"
        },
        {
            x: k_plt,
            y: [0],
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: 'blue'
            },
            name: "<i>k</i>"
        },
        {
            x: k_a,
            y: [0],
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
            },
            name: "<i>k Aliased</i>"
        },
        {
            x: bzp_x,
            y: bzp_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            name: "<br>First Brillouin Zone"
        },
        {
            x: bzm_x,
            y: bzm_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            name: ""
        },
    ];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}


// Interactive interfaces
kSlider.on('change', function () {
    k = kSlider.bootstrapSlider('getValue');  // Get new "global" value
    valsUpdate();
    createPlots();

    $('#kSliderVal').text(k)
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};


// Initialize
// ycUpdate();
// ydUpdate();
// yc2Update();
createPlots();
$('#kSliderVal').text(k);