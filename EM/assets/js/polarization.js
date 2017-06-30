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

var z = numeric.linspace(0, 10 * Math.PI, 200);

function updateXValue() {
    return numeric.sin(z);
}

function updateYValue() {
    var a = ndarray(new Float64Array(200));
    z = ndarray(z);
    console.log(z);
    ops.adds(a, z, phase);
    return unpack(ops.sineq(a));
}


// Plot
function createPlots() {
    var layout = {
        margin: {
            t: 0,
            b: 0
        }
        // sce: {
        //     domain: {
        //         x: [-2, 2],
        //         y: [-2, 2]
        //     },
        //     camera: {
        //         center: {
        //             x: 0,
        //             y: 0,
        //             z: 0
        //         },
        //         eye: {
        //             x: 2,
        //             y: 3,
        //             z: 10
        //         },
        //         up: {
        //             x: 0,
        //             y: 0,
        //             z: 1
        //         }
        //     }
        // }
    };

    // var trace = {
    //     x: updateXValue(),
    //     y: updateYValue(),
    //     z: z,
    //     mode: 'lines',
    //     type: 'scatter3d'
    //     // scene: 'sce'
    // };

    var trace1 = {
        mode: 'lines',
        type: 'scatter',
        x: updateXValue(),
        y: updateYValue()
    };

    Plotly.newPlot('plt0', trace1, layout);
    // Plotly.newPlot('plt1', [trace1]);
}

function plot() {
    plt0.data.x = updateXValue();
    plt0.data.y = updateYValue();
    // plt1.data.y = updateYValue();

    Plotly.redraw(plt0);
    // Plotly.redraw(plt1);
}


// Interactive interfaces
varphiSlider.on('change', function () {
    phase = varphiSlider.bootstrapSlider('getValue');  // Change "global" value
    plot();

    $('#varphiSliderVal').text(phase);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
createPlots();