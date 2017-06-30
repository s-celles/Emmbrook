/**
 * Created by qizhang on 6/24/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
"use strict";
// Import libraries
// var numeric = require("numeric");
var ndarray = require("ndarray");  // Modular multidimensional arrays for JavaScript.
var ops = require("ndarray-ops");  // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var unpack = require("ndarray-unpack");  // Converts an ndarray into an array-of-native-arrays.


// Initialize variables
// UI variables
var varphiSlider = $('#varphi').bootstrapSlider({});
var phase = varphiSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');

var z = ndarray(numeric.linspace(0, 10 * Math.PI, 200));
var x = ndarray(new Float64Array(200));
var y = ndarray(new Float64Array(200));

function updateXValue() {
    ops.sin(x, z);
}

function updateYValue() {
    ops.adds(y, z, phase);
    ops.sineq(y);
}


// Plot
function createPlots() {
    var layout = {
        margin: {
            t: 0,
            b: 0
        },
        sce: {
            domain: {
                x: [-2, 2],
                y: [-2, 2]
            },
            camera: {
                center: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                eye: {
                    x: 2,
                    y: 3,
                    z: 20
                },
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                }
            }
        }
    };

    var trace0 = {
        mode: 'lines',
        type: 'scatter3d',
        x: unpack(x),
        y: unpack(y),
        z: unpack(z),
        scene: 'sce'
    };

    var trace1 = {
        mode: 'lines',
        type: 'scatter',
        x: unpack(x),
        y: unpack(y)
    };

    Plotly.newPlot('plt0', [trace0], layout);
    Plotly.newPlot('plt1', [trace1]);
}

function plot() {
    plt0.data.x = unpack(x);
    plt0.data.y = unpack(y);

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}


// Interactive interfaces
varphiSlider.on('change', function () {
    phase = varphiSlider.bootstrapSlider('getValue');  // Change "global" value
    updateYValue();
    plot();

    $('#varphiSliderVal').text(phase);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
// createPlots();
updateXValue();
updateYValue();
createPlots();