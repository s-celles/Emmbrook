/**
 * Created by Qi on 5/27/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
"use strict";
// Import libraries
var numeric = require("numeric");
var ndarray = require("ndarray");
var gemm = require("ndarray-gemm");
var math = require('mathjs');


// Variables
var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue'); // Get incident angle from slider bar
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Variables for calculation
var epsilon1 = Math.pow(n1, 2); // Permittivity
var epsilon2 = Math.pow(n2, 2); // Permittivity


// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    plotRatios();
    updateSlopes();
    plotHeatmap();

    $('#thetaISliderVal').text(thetaI);
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotRatios();
    plotRatioLists();
    plotBrewsterAngle();
    updateSlopes();
    plotHeatmap();

    $('#n1SliderVal').text(n1);
});

n2Slider.on('change', function () {
    n2 = n2Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotRatios();
    plotRatioLists();
    plotBrewsterAngle();
    updateSlopes();
    plotHeatmap();

    $('#n2SliderVal').text(n2);
});


// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


///////////////////////////////////////////////////////////////////////////
//////////////////// EM oblique incidence on media ////////////////////////
///////////////////////////////////////////////////////////////////////////
var yCoord = numeric.linspace(0, 5, 250);
var zCoord = numeric.linspace(0, 5, 250);
var incidentSlope;
var reflectSlope;
var transmitSlope;


function kr(xx, yy, zz) {
    /*
     Wave vector times position vector.
     */
    var metricTensor = math.matrix([
        [Math.cos(Math.PI / 2 - thetaI), 0, Math.cos(thetaI)],
        [0, 1, 0],
        [Math.cos(thetaI), 0, Math.cos(Math.PI / 2 - thetaI)]
    ]);
    return math.dot([1, 1, 1], math.multiply(metricTensor, [xx, yy, zz]));
}

function updateIncidentAmplitude() {
    /*
     The incident E-field amplitude changes with x, y, z spatial coordinates, and thetaI.
     */
    var inciamp = [];
    for (var i = 0; i < yCoord.length; i++) {
        inciamp[i] = [];
        for (var j = 0; j < zCoord.length; j++) {
            inciamp[i][j] = kr(zCoord[j] * incidentSlope, yCoord[i], zCoord[j]);
        }
    }

    return inciamp;
}

function updateTransmitAmplitude() {
    /*
     The transmissive E-field amplitude changes with x, y, z spatial coordinates, n1, n2 and thetaI.
     */
    var transamp = [];
    for (var i = 0; i < yCoord.length; i++) {
        transamp[i] = [];
        for (var j = 0; j < zCoord.length; j++) {
            transamp[i][j] = kr(zCoord[j] * transmitSlope, yCoord[i], zCoord[j]);
        }
    }

    return transamp;
}

function updateSlopes() {
    /*
     Update incident/reflective/transmitted light slopes according to slider motion.
     Those change when thetaI, n1, and n2 change.
     */
    var thetaT = Math.asin(n1 / n2 * Math.sin(thetaI)); // Transmission angle
    incidentSlope = -Math.tan(thetaI);
    reflectSlope = Math.tan(thetaI);
    transmitSlope = -Math.tan(thetaT);
}


// Plot
function plotHeatmap() {
    plt0.data[0].z = updateIncidentAmplitude();
    plt0.data[1].z = updateTransmitAmplitude();

    Plotly.redraw(plt0);
}

function createHeatmap() {
    var upper = {
        x: yCoord,
        y: zCoord,
        z: updateIncidentAmplitude(),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -2,
        zmax: 10
    };

    var lower = {
        x: yCoord,
        y: zCoord,
        z: updateTransmitAmplitude(),
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -2,
        zmax: 10
    };

    var data = [upper, lower];

    var layout = {
        title: 'E filed amplitude',
        yaxis: {
            domain: [0.6, 1]
        },
        yaxis2: {
            domain: [0, 0.4]
        },
        xaxis2: {
            anchor: 'y2'
        }
    };

    Plotly.newPlot('plt0', data, layout);
}


///////////////////////////////////////////////////////////////////////////
////////////////// Reflection and transmission ratios /////////////////////
///////////////////////////////////////////////////////////////////////////
var reflectRatioList, transmitRatioList;
var thetaIList = numeric.linspace(0, Math.PI / 2, 200);


// Main interfaces
function updateRatioValues(tI) {
    /*
     Accept an incident angle tI, return the reflection ratio and transmission ratio.
     */
    var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
    var beta = n1 / n2 * epsilon2 / epsilon1;
    var t = 2 / (alpha + beta);
    var r = (alpha - beta) / (alpha + beta);
    return [r, t];
}

function updateRatioLists() {
    /*
     Return: An array of [[r0, r1, ...], [t0, t1, ...]].
     */
    return numeric.transpose(thetaIList.map(updateRatioValues));
}

function updateBrewsterAngle() {
    /*
     Brewster angle changes when n1, n2 changes.
     */
    epsilon1 = Math.pow(n1, 2);
    epsilon2 = Math.pow(n2, 2);
    return Math.atan(n1 / n2 * epsilon2 / epsilon1);
}


// Plot
function plotRatios() {
    /*
     Make 2 "ratios" points move as their real values.
     */
    plt1.data[2].x = [thetaI, thetaI];
    plt1.data[2].y = updateRatioValues(thetaI);
    Plotly.redraw(plt1);
}

function plotRatioLists() {
    /*
     Re-plot 2 curves.
     */
    plt1.data[0].y = reflectRatioList;
    plt1.data[1].y = transmitRatioList;

    Plotly.redraw(plt1);
}

function plotBrewsterAngle() {
    plt1.data[3].x = [updateBrewsterAngle()];
    Plotly.redraw(plt1);
}

function createRatioPlot() {
    var layout = {
        title: 'reflection and transmission ratio',
        xaxis: {
            title: 'theta_I',
            titlefont: {
                size: 18
            },
            tickmode: 'array',
            tickvals: [0, Math.PI / 12, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2],
            ticktext: ['0', 'pi/12', 'pi/6', 'pi/4', 'pi/3', 'pi/2']
        },
        yaxis: {
            title: 'Ratio',
            titlefont: {
                size: 18
            }
        }
    };

    var data = [
        {
            x: thetaIList,
            y: reflectRatioList,
            type: 'scatter',
            mode: 'lines',
            name: 'r'
        },
        {
            x: thetaIList,
            y: transmitRatioList,
            type: 'scatter',
            mode: 'lines',
            name: 't'
        },
        {
            x: [thetaI, thetaI],
            y: updateRatioValues(thetaI),
            type: 'scatter',
            mode: 'markers',
            name: 'ratios'
        },
        {
            x: [updateBrewsterAngle()],
            y: [0],
            type: 'scatter',
            mode: 'markers',
            name: 'Brewster angle'
        }
    ];

    Plotly.newPlot(plt1, data, layout);
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////// Initialize //////////////////////////////////
///////////////////////////////////////////////////////////////////////////
$('#thetaISliderVal').text(thetaI);
$('#n1SliderVal').text(n1);
$('#n2SliderVal').text(n2);
// Left panel
updateSlopes();
createHeatmap();
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();
