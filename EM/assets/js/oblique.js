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


// Variables
var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue');  // Get incident angle from slider bar
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Variables for calculation
var epsilon1 = Math.pow(n1, 2);  // Permittivity
var epsilon2 = Math.pow(n2, 2);  // Permittivity


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
var spatialX = 10;  // Spatial physical size
var spatialZ = 10;  // Spatial physical size
var nx = 200;  // Spatial grid size
var nz = 200;  // Spatial grid size
var leftX = numeric.linspace(0, -spatialX, nx);
var rightX = numeric.linspace(0, spatialX, nx);
var upperZ = numeric.linspace(0, spatialZ, nz);
var lowerZ = numeric.linspace(0, -spatialZ, nz);
var incidentSlope;
var reflectSlope;
var transmitSlope;


function generateLight(xList, zList, slope, amplitude) {
    /*
     Generate light amplitude for incident/reflective/transmitted light on a heatmap grid.
     */
    var amp = [];
    var bw;

    if (Math.abs(slope) > 3) {
        bw = 0.15;
    }
    else {
        bw = 0.10;
    }

    for (var i = 0; i < xList.length; i++) {
        amp[i] = [];
        for (var j = 0; j < zList.length; j++) {
            var cond = zList[j] - slope * xList[i];

            var kr = Math.sqrt(Math.pow(xList[i], 2) + Math.pow(zList[j], 2));
            var coeff = Math.cos(kr);
            if (-bw < cond && cond < bw) {
                amp[i][j] = Math.abs(amplitude) * coeff;
            }
            else {
                amp[i][j] = 0;
            }
        }
    }

    return amp;
}

function updateSlopes() {
    /*
     Update incident/reflective/transmitted light slopes according to slider motion.
     Those change when thetaI, n1, and n2 change.
     */
    var thetaT = Math.asin(n1 / n2 * Math.sin(thetaI));  // Transmission angle
    incidentSlope = -Math.tan(thetaI);
    reflectSlope = Math.tan(thetaI);
    transmitSlope = -Math.tan(thetaT);
}


// Plot
function createPlot() {

    var incidenthm = {
        x: leftX,
        y: upperZ,
        z: generateLight(leftX, upperZ, incidentSlope, 1),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var reflecthm = {
        x: rightX,
        y: upperZ,
        z: generateLight(rightX, upperZ, reflectSlope, 0.5),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var transmithm = {
        x: rightX,
        y: lowerZ,
        z: generateLight(rightX, lowerZ, transmitSlope, 0.2),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var empty = {
        x: leftX,
        y: lowerZ,
        z: generateLight(leftX, lowerZ, 0, 0),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var interfaceLine = {
        x: [-spatialX, spatialX],
        y: [0, 0],
        mode: 'lines',
        color: 'black'
    };

    var data = [incidenthm, reflecthm, transmithm, empty, interfaceLine];

    var layout = {
        title: 'E filed amplitude',
        xaxis: {
            title: 'x',
            fontsize: 18,
            range: [-spatialX, spatialX],
            domain: [0, 1]
        },
        yaxis: {
            title: 'z',
            fontsize: 18,
            range: [-spatialZ, spatialZ],
            domain: [0, 1]
        }
    };

    Plotly.newPlot('plt0', data, layout);
}

function plotHeatmap() {
    plt0.data[0].z = generateLight(leftX, upperZ, incidentSlope, 1);
    plt0.data[1].z = generateLight(rightX, upperZ, reflectSlope, updateRatioValues(thetaI)[0]);
    plt0.data[2].z = generateLight(rightX, lowerZ, transmitSlope, updateRatioValues(thetaI)[1]);
    Plotly.redraw(plt0);
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
createPlot();
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();