/**
 * Created by qizhang on 6/24/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
"use strict";
// Import libraries
var numeric = require("numeric");


// Initialize variables
// UI variables
var phiSlider = $('#phi').bootstrapSlider({});
var phi = phiSlider.bootstrapSlider('getValue');


var z = numeric.linspace(0, 10 * Math.PI, 200);

function updateXValue() {
    return numeric.sin(z);
}

function updateYValue(t) {
    return numeric.sin(numeric.addeq(z, phi - 10 * t));
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
                    z: 10
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
        x: updateXValue(),
        y: updateYValue(0),
        z: z,
        scene: 'sce'
    };

    var trace1 = {
        mode: 'lines',
        type: 'scatter',
        x: updateXValue(),
        y: updateYValue(0)
    };

    Plotly.newPlot('plt0', [trace0], layout);
    Plotly.newPlot('plt1', [trace1]);
}

function plot(t) {
    plt0.data.y = updateYValue(t);
    plt1.data.y = updateYValue(t);

    Plotly.redraw(plt0);
}


// Interactive interfaces
phiSlider.on('change', function () {
    phi = phiSlider.bootstrapSlider('getValue');  // Change "global" value
    plot(0);

    $('#phiSliderVal').text(phi);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
createPlots();