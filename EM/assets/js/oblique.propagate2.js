/**
 * Created by Qi on 6/12/17.
 */

var spatialX = 1;  // Spatial physical size
var spatialZ = 1;  // Spatial physical size
var nx = 500;  // Spatial grid size
var nz = 500;  // Spatial grid size
var a = numeric.linspace(0, -spatialX, nx);
var b = numeric.linspace(0, spatialZ, nz);
var c = numeric.linspace(0, spatialX, nx);
var f = numeric.linspace(0, -spatialZ, nz);

function generateLight(xList, zList, slope, intensity) {
    var intens = [];

    for (var i = 0; i < xList.length; i++) {
        intens[i] = [];
        for (var j = 0; j < zList.length; j++) {
            var cond = zList[j] - slope * xList[i];
            if (-0.005 < cond && cond < 0.005) {
                intens[i][j] = intensity;
            }
            else {
                intens[i][j] = 0;
            }
        }
    }

    return intens
}


// Plot
function createPlot() {

    var incidenthm = {
        x: a,
        y: b,
        z: generateLight(a, b, -Math.tan(Math.PI / 2 - thetaI), 1),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var reflecthm = {
        x: c,
        y: b,
        z: generateLight(c, b, Math.tan(Math.PI / 2 - thetaI), 0.5),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var transmithm = {
        x: c,
        y: f,
        z: generateLight(c, f, -Math.tan(thetaT), 0.2),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var empty = {
        x: a,
        y: f,
        z: generateLight(a, f, 0, 0),
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: 0,
        zmax: 1
    };

    var data = [incidenthm, reflecthm, transmithm, empty];

    var layout = {
        title: 'E filed intensity',
        xaxis: {
            title: 'x',
            fontsize: 18
        },
        yaxis: {
            title: 'z',
            fontsize: 18
        }
    };

    Plotly.newPlot('plt0', data, layout)

}

// Plot
function plotHeatmap() {
    plt0.data[0].z = generateLight(a, b, -Math.tan(Math.PI / 2 - thetaI), 1);
    plt0.data[1].z = generateLight(c, b, Math.tan(Math.PI / 2 - thetaI), 0.5);
    plt0.data[2].z = generateLight(c, f, -Math.tan(thetaT), 0.2);
    Plotly.redraw(plt0)
}

// Initialize
createPlot();