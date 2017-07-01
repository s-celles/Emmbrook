/**
 * Created by qizhang on 6/24/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
"use strict";
// Import libraries
var linspace = require('ndarray-linspace');  // Fill an ndarray with equally spaced values.
var ndarray = require("ndarray");  // Modular multidimensional arrays for JavaScript.
var ops = require("ndarray-ops");  // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var unpack = require("ndarray-unpack");  // Converts an ndarray into an array-of-native-arrays.


// Initialize variables
// UI variables
var phiSlider = $('#phi').bootstrapSlider({});
var thetaSlider = $('#theta').bootstrapSlider({});
var phi = phiSlider.bootstrapSlider('getValue');
var theta = thetaSlider.bootstrapSlider('getValue');  // z values in one cycle.
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Normal variables
var nPoints = 200;
var z = linspace(ndarray([], [nPoints]), 0, 10 * Math.PI);
var x = ndarray(new Float64Array(nPoints));
var y = ndarray(new Float64Array(nPoints));
var r;  // sqrt(x^2 + y^2)


// Basic interfaces
function updateXValue() {
    /*
     x values will not change in this simulation.
     */
    ops.sin(x, z);
}

function updateYValue() {
    /*
     y values will change if phase changes.
     */
    ops.adds(y, z, phi);
    ops.sineq(y);
}

function updateR() {
    /*
     r value changes when phase and theta changes.
     */
    r = Math.sqrt(Math.pow(Math.sin(theta), 2) + Math.pow(Math.sin(theta + phi), 2));
}


// Plot
function createPlots() {
    var layout0 = {
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

    var layout1 = {
        margin: {
            t: 50,
            b: 50
        },
        domain: {
            x: [-1, 1],
            y: [-1, 1]
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
        y: unpack(y),
        name: 'polarization'
    };

    var trace2 = {
        mode: 'lines',
        type: 'scatter',
        x: [0, r * Math.cos(theta)],
        y: [0, r * Math.sin(theta)],
        name: 'Jones vector'
    };

    var data0 = [trace0];
    var data1 = [trace1, trace2];

    Plotly.newPlot('plt0', data0, layout0);
    Plotly.newPlot('plt1', data1, layout1);
}

function plot() {
    plt0.data[0].y = unpack(y);

    plt1.data[0].y = unpack(y);
    plt1.data[1].x = [0, r * Math.cos(theta)];
    plt1.data[1].y = [0, r * Math.sin(theta)];

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}


// Interactive interfaces
phiSlider.on('change', function () {
    phi = phiSlider.bootstrapSlider('getValue');  // Change "global" value
    updateYValue();
    plot();

    $('#varphiSliderVal').text(phi);
});

thetaSlider.on('change', function () {
    theta = thetaSlider.bootstrapSlider('getValue');  // Change "global" value
    updateR();
    plot();
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