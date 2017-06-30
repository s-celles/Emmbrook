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
var varphiSlider = $('#varphi').bootstrapSlider({});
var varphi = varphiSlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');


var z = numeric.linspace(0, 10 * Math.PI, 200);

function updateXValue() {
    return numeric.sin(z);
}

function updateYValue() {
    return numeric.sin(numeric.addeq(z, varphi));
}


// Plot
function createPlots() {
    // var layout = {
    //     margin: {
    //         t: 0,
    //         b: 0
    //     }
    //     // sce: {
    //     //     domain: {
    //     //         x: [-2, 2],
    //     //         y: [-2, 2]
    //     //     },
    //     //     camera: {
    //     //         center: {
    //     //             x: 0,
    //     //             y: 0,
    //     //             z: 0
    //     //         },
    //     //         eye: {
    //     //             x: 2,
    //     //             y: 3,
    //     //             z: 10
    //     //         },
    //     //         up: {
    //     //             x: 0,
    //     //             y: 0,
    //     //             z: 1
    //     //         }
    //     //     }
    //     // }
    // };

    var trace0 = {
        mode: 'lines',
        type: 'scatter3d',
        x: updateXValue(),
        y: updateYValue(),
        z: z
        // scene: 'sce'
    };

    var trace1 = {
        mode: 'lines',
        type: 'scatter',
        x: updateXValue(),
        y: updateYValue()
    };

    Plotly.newPlot('plt0', [trace0]);
    Plotly.newPlot('plt1', [trace1]);
}

function plot() {
    plt0.data.y = updateYValue();
    plt1.data.y = updateYValue();

    Plotly.redraw(plt0);
    Plotly.redraw(plt1);
}


// Interactive interfaces
varphiSlider.on('change', function () {
    varphi = varphiSlider.bootstrapSlider('getValue');  // Change "global" value
    plot();

    $('#varphiSliderVal').text(varphi);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
createPlots();