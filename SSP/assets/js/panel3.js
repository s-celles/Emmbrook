/**
 * Originally written by Makani Cartwright.
 * Modified by Qi on 12/5/17.
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
let q_e = 1.602 * Math.pow(10, -19);
let hbar = 1.05 * Math.pow(10, -34);
let DE_A = q_e;
let N_A = [];
let p = [];
let N_C;
let N_V = 0;
let m_e = 9.11 * Math.pow(10, -31);
let kb = 1.38 * Math.pow(10, -23);
let Q;
let mu = [];
// Interactive variables
let deltaSlider = $('#delta').bootstrapSlider({});
let TSlider = $('#T').bootstrapSlider({});
let delta = deltaSlider.bootstrapSlider('getValue');
let T = TSlider.bootstrapSlider('getValue');
let plt0 = document.getElementById('plt0');
let plt1 = document.getElementById('plt1');


// Interfaces
function calculateN_CV(t, m) {
    return 0.0449 * Math.pow(kb * t * 2 * m * m_e / Math.pow(hbar, 2), 3 / 2);
}

function calculateQ(dea, t) {
    let eq = -dea / (kb * t);
    return Math.exp(eq);
}

function calculateP(nv, q, na) {
    let eq = 4 * na / (q * nv);
    if (na < .00001 * q * nv) {
        return na;
    } else {
        eq = Math.sqrt(1 + eq);
        eq = eq - 1;
        return q * N_V / 2 * eq;
    }
}

function calculateMu(t, nv, p) {
    return kb * t * Math.log(nv / p);
}


function initialize() {
    N_A = [];
    N_V = calculateN_CV(T, 1.15);
    N_C = calculateN_CV(T, 1);
    Q = calculateQ(DE_A, T);
    for (let i = 0; i < 60; i += .5) {
        N_A.push(Math.exp(i));
    }
    createPlots();
}

function createPlots() {
    let P = [];
    mu = [];
    for (let i = 0; i < N_A.length; i++) {
        P.push(calculateP(N_V, Q, N_A[i]));
        mu.push(calculateMu(T, N_V, P[i]));
    }
    let layout0 = {
        margin: {
            t: 20,
            l: 60,
            r: 20,
        },
        yaxis: {
            title: 'log <i>p</i> (cm<sup>-3</sup>)',
            type: 'log'
        },
        xaxis: {
            title: 'log <i>N<sub>A</sub></i> (cm<sup>-3</sup>)',
            type: 'log'
        }
    };

    let layout1 = {
        margin: {
            t: 20,
            l: 90,
            r: 20,
        },
        xaxis: {
            title: '<i>p</i> (cm<sup>-3</sup>)'
        },
        yaxis: {
            title: 'Fermi Level (eV)'
        },
    };

    let data0 = [{
        x: N_A,
        y: P,
        type: 'scatter',
        mode: 'lines+markers',
        name: "Potential"
    }];

    let data1 = [{
        x: P,
        y: mu,
        type: 'scatter',
        mode: 'markers',
        marker: {
            size: 8,
            color: 'blue'
        }
    }];

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}


// Interactive interfaces
deltaSlider.on('change', function () {
    delta = deltaSlider.bootstrapSlider('getValue');  // Get new "global" value
    DE_A = delta * q_e;
    initialize();

    $('#deltaSliderVal').text(delta);
});

TSlider.on('change', function () {
    T = TSlider.bootstrapSlider('getValue');  // Get new "global" value
    initialize();

    $('#TSliderVal').text(T);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
N_V = calculateN_CV(T, 1.15);
N_C = calculateN_CV(T, 1);
Q = calculateQ(DE_A, T);
for (let i = 0; i < 60; i += 0.5) {
    N_A.push(Math.exp(i));
}
createPlots();
$('#deltaSliderVal').text(delta);
$('#TSliderVal').text(T);