/**
 * Created by Qi on 6/12/17.
 */

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

    if (Math.abs(slope) > 3) {
        var bw = 0.10;
    }
    else {
        bw = 0.05;
    }

    // Produce a light with width 2 * bw.
    for (var i = 0; i < xList.length; i++) {
        amp[i] = [];
        for (var j = 0; j < zList.length; j++) {
            var cond = zList[j] - slope * xList[i];
            if (-bw < cond && cond < bw) {
                amp[i][j] = amplitude;
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
        zmin: -0.2,
        zmax: 1
    };

    var reflecthm = {
        x: rightX,
        y: upperZ,
        z: generateLight(rightX, upperZ, reflectSlope, 0.5),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -0.2,
        zmax: 1
    };

    var transmithm = {
        x: rightX,
        y: lowerZ,
        z: generateLight(rightX, lowerZ, transmitSlope, 0.2),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -0.2,
        zmax: 1
    };

    var empty = {
        x: leftX,
        y: lowerZ,
        z: generateLight(leftX, lowerZ, 0, 0),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -0.2,
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

// Plot
function plotHeatmap() {
    plt0.data[0].z = generateLight(leftX, upperZ, incidentSlope, 1);
    plt0.data[1].z = generateLight(rightX, upperZ, reflectSlope, r);
    plt0.data[2].z = generateLight(rightX, lowerZ, transmitSlope, t);
    Plotly.redraw(plt0);
}

// Initialize
updateSlopes();
createPlot();