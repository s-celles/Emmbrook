/**
 * Created by qizhang on 6/24/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
'use strict';
// Import libraries
var linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values.
var ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
var ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
var pool = require('ndarray-scratch'); // A simple wrapper for typedarray-pool.


// Initialize variables
// UI variables
var phiSlider = $('#phi').bootstrapSlider({});
var timeSlider = $('#time').bootstrapSlider({});
var BoverASlider = $('#BoverA').bootstrapSlider({});
var phi = phiSlider.bootstrapSlider('getValue');
var time = timeSlider.bootstrapSlider('getValue');
var BoverA = BoverASlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Start and stop animation
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var reqId; // Cancels an animation frame request previously scheduled through a call to window.requestAnimationFrame().
// Normal variables
var nPoints = 200;
var z = linspace(ndarray([], [nPoints]), 0, 8 * Math.PI);
var x = ndarray(new Float64Array(nPoints));
var y = ndarray(new Float64Array(nPoints));
var speed = 1; // Wave speed


// Interactive interfaces
phiSlider.on('change', function () {
    phi = phiSlider.bootstrapSlider('getValue'); // Change "global" value
    updateX();
    updateY();
    updateZ();
    plot();

    $('#phiSliderVal').text(phi);
});

timeSlider.on('change', function () {
    time = timeSlider.bootstrapSlider('getValue'); // Change "global" value
    updateX();
    updateY();
    updateZ();
    plot();

    $('#timeSliderVal').text(time);
});

BoverASlider.on('change', function () {
    BoverA = BoverASlider.bootstrapSlider('getValue'); // Change "global" value
    updateX();
    updateY();
    updateZ();
    plot();

    $('#BoverASliderVal').text(BoverA);
});

var isAnimationOff = true; // No animation as default
$('#animate').click(function () {
    var $this = $(this);
    if (isAnimationOff) { // If no animation, a click starts it.
        isAnimationOff = false;
        $this.text('Off');
        reqId = requestAnimationFrame(animatePlot0); // Start animation
    } else { // If is already in animation, a click stop it.
        isAnimationOff = true;
        $this.text('On');
        cancelAnimationFrame(reqId); // Stop animation
    }
});

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
$('#BoverASliderVal').text(BoverA);


///////////////////////////////////////////////////////////////////////////
///////////////////////////// Static plots ////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Basic interfaces
function updateX() {
    /*
     x values will change if time changes.
     x = sin(k * z - w * t)
     */
    ops.subs(x, z, time); // x = z - t
    ops.sineq(x); // x = sin(z - t)
}

function updateY() {
    /*
     y values will change if phase or time change.
     y = sin(k * z - w * t + phi)
     */
    ops.adds(y, z, phi - time); // y = z - t + phi
    ops.sineq(y); // y = sin(z - t + phi)
    ops.mulseq(y, BoverA);
}

function updateZ() {
    /*
     z values will change if time changes.
     */
    z = linspace(ndarray([], [nPoints]),
        time * speed, 10 * Math.PI + time * speed);
}


// Plot
function createPlots() {
    var layout0 = {
        title: '3D view',
        scene: {
            margin: {
                t: 0,
                b: 0
            },
            xaxis: {
                range: [-1, 1]
            },
            yaxis: {
                range: [-1, 1]
            }
        }
    };

    var layout1 = {
        title: '2D bird-view',
        margin: {
            t: 50,
            b: 50
        },
        xaxis: {
            title: 'x',
            range: [-1, 1]
        },
        yaxis: {
            title: 'y',
            range: [-1, 1]
        }
    };

    var trace0 = {
        mode: 'lines',
        type: 'scatter3d',
        x: unpack(x),
        y: unpack(y),
        z: unpack(z),
        name: 'E',
        scene: 'scene'
    };

    var trace1 = {
        mode: 'lines',
        type: 'scatter3d',
        x: unpack(x),
        y: unpack(pool.zeros([nPoints])),
        z: unpack(z),
        name: 'Ex'
    };

    var trace2 = {
        mode: 'lines',
        type: 'scatter3d',
        x: unpack(pool.zeros([nPoints])),
        y: unpack(y),
        z: unpack(z),
        name: 'Ey'
    };

    var trace3 = {
        mode: 'lines',
        type: 'scatter',
        x: unpack(x),
        y: unpack(y)
    };

    var data0 = [trace0, trace1, trace2];
    var data1 = [trace3];

    Plotly.newPlot('plt0', data0, layout0);
    Plotly.newPlot('plt1', data1, layout1);
}

function plot() {
    plt0.data[0].x = unpack(x);
    plt0.data[0].y = unpack(y);
    plt0.data[0].z = unpack(z);
    plt0.data[1].x = unpack(x);
    plt0.data[1].z = unpack(z);
    plt0.data[2].y = unpack(y);
    plt0.data[2].z = unpack(z);

    plt1.data[0].x = unpack(x);
    plt1.data[0].y = unpack(y);

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}


///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Animation /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
function compute() {
    /*
     Update z every frame and simultaneously update x and y.
     */
    var dt = 0.05;
    ops.subs(x, z, dt);
    ops.sineq(x);
    ops.adds(y, z, phi - dt);
    ops.sineq(y);
    ops.mulseq(y, BoverA);
    ops.addseq(z, dt);
}

function animatePlot0() {
    compute();

    Plotly.animate('plt0', {
        data: [{
            x: unpack(x),
            y: unpack(y),
            z: unpack(z)
        }, {
            x: unpack(x),
            y: unpack(pool.zeros([nPoints])),
            z: unpack(z)
        }, {
            x: unpack(pool.zeros([nPoints])),
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

    reqId = requestAnimationFrame(animatePlot0); // Return the request id, that uniquely identifies the entry in the callback list.
}