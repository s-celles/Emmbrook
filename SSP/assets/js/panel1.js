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
const nc = 1000;
const ns = 20;
// Panel 1
let xc = nj.arange(0., 1., 1. / nc).tolist();
let xd = nj.arange(0., 1., 1. / ns).tolist();
let yc = new Array(nc);
let yd = [];
let yda = [];
// Panel 2
let k_x = [];
let k_y = [];
let k_plt = [0];
let ka = null;
let k_a = [];
let bzp_x = [];
let bzp_y = [];
let bzm_x = [];
let bzm_y = [];
// Interactive variables
let kSlider = $('#k').bootstrapSlider({});
let k = kSlider.bootstrapSlider('getValue');
let plt0 = document.getElementById('plt0');
let plt1 = document.getElementById('plt1');


//Initializes Plots
/**
 * Updates Waveform.
 */
function ycUpdate() {
    for (let i = 0; i < (nc + 1); i++) {
        yc[i] = Math.cos(2 * Math.PI * k * xc[i]);
    }
}

/**
 * Updates Sampled.
 */
function ydUpdate() {
    for (let i = 0; i < (ns + 1); i++) {
        yd[i] = Math.cos(2 * Math.PI * k * xd[i]);
    }
}

/**
 * Updates Aliased.
 */
function kaUpdate() {
    if (k > ns / 2) {
        ka = k - ns;
        k_a = [ka];
        for (let i = 0; i < (nc + 1); i++) {
            yda[i] = Math.cos(2 * Math.PI * ka * xc[i]);
        }
    } else if (k < -ns / 2) {
        ka = parseInt(k) + ns;
        k_a = [ka];
        for (let i = 0; i < (nc + 1); i++) {
            yda[i] = Math.cos(2 * Math.PI * ka * xc[i]);
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

function valsUpdate() {
    k_plt = [k];
    ycUpdate();
    ydUpdate();
    kaUpdate();
}


// Plot
function initial() {
    for (let i = -ns; i <= ns; i++) {
        k_x.push(i);
        k_y.push(0);
    }

    for (let i = -0.2; i <= 0.2; i += 0.05) {
        bzp_x.push(ns / 2);
        bzp_y.push(i);
        bzm_x.push(-ns / 2);
        bzm_y.push(i);
    }
    valsUpdate();
    createPlots();
}

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
        title: '<i>k</i> Space',
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
            name: 'k Values'
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
            name: '<i>k</i>'
        },
        {
            x: k_a,
            y: [0],
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
            },
            name: '<i>k Aliased</i>'
        },
        {
            x: bzp_x,
            y: bzp_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            name: 'First Brillouin Zone'
        },
        {
            x: bzm_x,
            y: bzm_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            showlegend: false,
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

    $('#kSliderVal').text(k);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
initial();
$('#kSliderVal').text(k);