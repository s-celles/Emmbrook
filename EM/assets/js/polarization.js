/**
 * Created by qizhang on 6/24/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
"use strict";
// Import libraries
var linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values.
var ndarray = require("ndarray"); // Modular multidimensional arrays for JavaScript.
var ops = require("ndarray-ops"); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var unpack = require("ndarray-unpack"); // Converts an ndarray into an array-of-native-arrays.


// Initialize variables
// UI variables
var phiSlider = $('#phi').bootstrapSlider({});
var timeSlider = $('#time').bootstrapSlider({});
var phi = phiSlider.bootstrapSlider('getValue');
var time = timeSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Normal variables
var nPoints = 200;
var z = linspace(ndarray([], [nPoints]), 0, 8 * Math.PI);
var x = ndarray(new Float64Array(nPoints));
var y = ndarray(new Float64Array(nPoints));
var speed = 10; // Wave speed
var theta = time * speed;
var r; // sqrt(x^2 + y^2)


// Basic interfaces
function updateX() {
    /*
     x values will change if time changes.
     x = sin(k * z - w * t)
     */
    ops.subs(x, z, time); // x = z - t
    ops.sineq(x);   // x = sin(z - t)
}

function updateY() {
    /*
     y values will change if phase or time change.
     y = sin(k * z - w * t + phi)
     */
    ops.adds(y, z, phi - time);  // y = z - t + phi
    ops.sineq(y);  // y = sin(z - t + phi)
}

function updateZ() {
    /*
     z values will change if time changes.
     */
    z = linspace(ndarray([], [nPoints]), time * speed, 10 * Math.PI + time * speed);
}

function updateR() {
    /*
     r value changes when phase and theta changes.
     */
    r = Math.sqrt(Math.pow(Math.sin(theta), 2) + Math.pow(Math.sin(theta + phi), 2));
}

function updateTheta() {
    theta = time * speed;
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
            x: [-1.1, 1.1],
            y: [-1.1, 1]
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
    plt0.data[0].x = unpack(x);
    plt0.data[0].y = unpack(y);
    plt0.data[0].z = unpack(z);

    plt1.data[0].x = unpack(x);
    plt1.data[0].y = unpack(y);
    plt1.data[1].x = [0, r * Math.cos(theta)];
    plt1.data[1].y = [0, r * Math.sin(theta)];

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}

// Animation
function compute() {
    /*
     Update z every frame and simultaneously update x and y.
     */
    var dt = 0.1;
    ops.subs(x, z, dt);
    ops.sineq(x);
    ops.adds(y, z, phi - dt);
    ops.sineq(y);
    ops.addseq(z, dt);
}

function animatePlot0() {
    compute();

    Plotly.animate('plt0', {
        data: [{
            x: unpack(x),
            y: unpack(y),
            z: unpack(z)
        }]
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: false
        }
    });

    requestAnimationFrame(animatePlot0);
}

function stopAnimation() {
    Plotly.animate('plt0', {}, {mode: 'next'});
}

function animatePlot() {
    ops.sineq(x);
    ops.taneq(y);
    1;
    // timeSlider.bootstrapSlider('refresh');  // To make it synchronously changing
    Plotly.animate('plt1', {
        data: [{
            x: unpack(x),
            y: unpack(y)
        }]
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: false
        }
    });

    requestAnimationFrame(animatePlot);
}

// requestAnimationFrame(animatePlot);

// Interactive interfaces
phiSlider.on('change', function () {
    phi = phiSlider.bootstrapSlider('getValue'); // Change "global" value
    updateY();
    plot();

    $('#phiSliderVal').text(phi);
});

timeSlider.on('change', function () {
    time = timeSlider.bootstrapSlider('getValue'); // Change "global" value
    updateX();
    updateY();
    updateZ();
    updateR();
    updateTheta();
    plot();

    $('#timeSliderVal').text(time);
});

// $('#on').on('click', function startAnimation() {
//     requestAnimationFrame(animatePlot0);
// });
//
// $('#off').on('click', stopAnimation());

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
updateX();
updateY();
createPlots();
$('#phiSliderVal').text(phi);
$('#timeSliderVal').text(time);